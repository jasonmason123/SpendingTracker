using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SpendingTracker_API.Context;
using SpendingTracker_API.Entities;
using SpendingTracker_API.Repositories.TransactionRepository;
using SpendingTracker_API.Repositories.UnitOfWork;
using SpendingTracker_API.Utils.UserRetriever;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using SpendingTracker_API.Utils;
using SpendingTracker_API.Authentication.PasswordAuthentication;
using Microsoft.AspNetCore.Authorization;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.FileProviders;
using DotNetEnv;
using SpendingTracker_API.Authentication.OtpAuthentication;
using Microsoft.AspNetCore.Localization;
using Microsoft.Extensions.Options;
using SpendingTracker_API.Repositories.CategoryRepository;
using SpendingTracker_API.Utils.AuthTokenService;
using SpendingTracker_API.Utils.NotificationService;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env file on local development
Env.Load();

// Add configurations.
builder.Configuration.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
builder.Configuration.AddEnvironmentVariables();

// Add services to the container.
builder.Services.AddScoped<IAppUnitOfWork, EfUnitOfWork>();
builder.Services.AddScoped<ITransactionRepository, EfTransactionRepository>();
builder.Services.AddScoped<ICategoryRepository, EfCategoryRepository>();
builder.Services.AddScoped<IUserClaimsRetriever, UserClaimsRetriever>();
builder.Services.AddScoped<IPasswordAuth, PasswordAuth>();
builder.Services.AddScoped<IAuthTokenProvider, JwtProvider>();
builder.Services.AddScoped<INotificationSender, EmailSender>();
builder.Services.AddScoped<IOtpAuth, EmailOtpAuth>();

// Add localization for language configurations
builder.Services.AddLocalization();
builder.Services.Configure<RequestLocalizationOptions>(options =>
{
    var supportedCultures = new[] { "en", "vi" };
    options.SetDefaultCulture("en")
           .AddSupportedCultures(supportedCultures)
           .AddSupportedUICultures(supportedCultures);
    options.RequestCultureProviders.Insert(0, new CookieRequestCultureProvider());
});

// Add Razor Pages for serving static files and views
builder.Services.AddRazorPages()
    .AddViewLocalization()
    .AddDataAnnotationsLocalization();

// Configure Identity options
builder.Services.Configure<IdentityOptions>(options =>
{
    //Lockout settings
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;

    options.User.RequireUniqueEmail = true;
});

// Add authentication
var jwtIssuer = builder.Configuration["JwtSettings:Issuer"];
var jwtAudience = builder.Configuration["JwtSettings:Audience"];
builder.Services.AddAuthentication()
// Define scheme for mobile authentication
.AddJwtBearer(AuthSchemes.MOBILE_AUTH_SCHEME, options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable(EnvNames.JWT_SECRET_KEY) ?? ""))
    };
})
// Define scheme for web authentication
.AddJwtBearer(AuthSchemes.WEB_AUTH_SCHEME, options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable(EnvNames.JWT_SECRET_KEY) ?? ""))
    };

    //Get jwt from cookie
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = ctx =>
        {
            ctx.Request.Cookies.TryGetValue(AppConst.JWT_COOKIE_KEY, out var accessToken);
            if (!string.IsNullOrEmpty(accessToken))
                ctx.Token = accessToken;
            return Task.CompletedTask;
        }
    };
})
.AddCookie("External")
.AddGoogle(options =>
{
    options.ClientId = Environment.GetEnvironmentVariable(EnvNames.GOOGLE_CLIENT_ID) ?? "";
    options.ClientSecret = Environment.GetEnvironmentVariable(EnvNames.GOOGLE_CLIENT_SECRET) ?? "";
    options.SignInScheme = "External";
    options.Scope.Add("email");
    options.Scope.Add("profile");
    options.SaveTokens = true;
});

// Define different policies for authorization
builder.Services.AddAuthorization(options =>
{
    // Use all schemes when applying [Authorization]
    options.DefaultPolicy = new AuthorizationPolicyBuilder(
        AuthSchemes.MOBILE_AUTH_SCHEME,
        AuthSchemes.WEB_AUTH_SCHEME)
        .RequireAuthenticatedUser()
        .Build();

    // Policy for mobile authentication
    options.AddPolicy(
        AuthSchemes.MOBILE_AUTH_SCHEME,
        new AuthorizationPolicyBuilder(
            AuthSchemes.WEB_AUTH_SCHEME)
        .RequireAuthenticatedUser()
        .Build());

    // Policy for web authentication
    options.AddPolicy(
        AuthSchemes.WEB_AUTH_SCHEME,
        new AuthorizationPolicyBuilder(
            AuthSchemes.WEB_AUTH_SCHEME)
        .RequireAuthenticatedUser()
        .Build());
});

// Configure cookie policy options
builder.Services.Configure<CookiePolicyOptions>(options =>
{
    options.MinimumSameSitePolicy = SameSiteMode.None;
    options.Secure = CookieSecurePolicy.Always;
});

// Configure CORS policy to allow requests from the frontend
const string COMMON_POLICY_NAME = "CommonPolicy";
builder.Services.AddCors(options =>
{
    options.AddPolicy(COMMON_POLICY_NAME, policy =>
    {
        policy.WithOrigins(
                "http://localhost:7027",
                "https://spendingtracker-bsov.onrender.com"
              )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // this allows cookies
    });
});

// Add memory cache for caching purposes
builder.Services.AddMemoryCache();

// Add HttpContextAccessor to access the current user context
builder.Services.AddHttpContextAccessor();

// Add db context
var connectionString = Environment.GetEnvironmentVariable(EnvNames.POSTGRES_CONNECTION_STRING);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Add Identity services
builder.Services.AddIdentity<AppUser, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Add Data Protection to persist cookie storage
// After redeployment, the key storage file will be overwritten, which means that old authentication sessions will not work.
// TODO: Find a way to persist key storage file on server, so that only 1 key is used across deployments. And the file must be stored securely and not be commited to Git.
// TODO: Or change cookie authentication to putting JWT inside cookies for simplicity.
//builder.Services.AddDataProtection()
//    .SetApplicationName("SpendingTracker")
//    .PersistKeysToFileSystem(new DirectoryInfo("/app/keys"));

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseRequestLocalization(app.Services.GetRequiredService<IOptions<RequestLocalizationOptions>>().Value);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Serve React app static files when URL starts with "/app"
app.MapWhen(context => context.Request.Path.StartsWithSegments("/app"), appBuilder =>
{
    // Serve static files from "wwwroot/app"
    appBuilder.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(
            Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "app")),
        RequestPath = "/app"
    });

    // Fallback to index.html for SPA routes
    appBuilder.Run(async context =>
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(
            Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "app", "index.html"));
    });
});

// Trust proxy headers for forwarded headers
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost
});

app.UseCookiePolicy();

app.UseCors(COMMON_POLICY_NAME);

//app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

// Serve static files from wwwroot
app.UseStaticFiles();

app.MapControllers();

app.MapRazorPages();

app.Run();
