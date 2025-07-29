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
using SpendingTracker_API.Services.AuthTokenService;
using SpendingTracker_API.Services.NotificationService;
using SpendingTracker_API.Services.EmailService;
using Microsoft.AspNetCore.Authorization;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.FileProviders;
using DotNetEnv;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env file on local development
Env.Load();

// Add configurations.
builder.Configuration.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
builder.Configuration.AddEnvironmentVariables();

// Added host configuration (Bind host to 0.0.0.0 to match Render's configuration)
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// Add services to the container.
builder.Services.AddScoped<IAppUnitOfWork, EfUnitOfWork>();
builder.Services.AddScoped<ITransactionRepository, EfTransactionRepository>();
builder.Services.AddScoped<IUserClaimsRetriever, UserClaimsRetriever>();
builder.Services.AddScoped<IPasswordAuth, PasswordAuth>();
builder.Services.AddScoped<IAuthTokenService, JwtService>();
builder.Services.AddScoped<INotificationService, EmailService>();

// Add Razor Pages for serving static files and views
builder.Services.AddRazorPages();

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
builder.Services.AddAuthentication()
.AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
{
    options.Cookie.SameSite = SameSiteMode.None;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
})
.AddJwtBearer(options =>
{
    var issuer = builder.Configuration["JwtSettings:Issuer"];
    var audience = builder.Configuration["JwtSettings:Audience"];

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable(EnvNames.JWT_SECRET_KEY) ?? ""))
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
        CookieAuthenticationDefaults.AuthenticationScheme,
        JwtBearerDefaults.AuthenticationScheme)
        .RequireAuthenticatedUser()
        .Build();

    // Policy for JWT only authentication
    options.AddPolicy(
        AppConst.JWT_ONLY_AUTH_SCHEME,
        new AuthorizationPolicyBuilder(
            JwtBearerDefaults.AuthenticationScheme)
        .RequireAuthenticatedUser()
        .Build());

    // Policy for Cookie only authentication
    options.AddPolicy(
        AppConst.COOKIE_ONLY_AUTH_SCHEME,
        new AuthorizationPolicyBuilder(
            CookieAuthenticationDefaults.AuthenticationScheme)
        .RequireAuthenticatedUser()
        .Build());
});

// Configure cookie policy options
builder.Services.Configure<CookiePolicyOptions>(options =>
{
    options.MinimumSameSitePolicy = SameSiteMode.None;
    options.Secure = CookieSecurePolicy.Always;
});

// ===== Configure Identity =======
builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/app/sign-in";
    options.Cookie.SameSite = SameSiteMode.None;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // Always use secure cookies

    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };

    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    };
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
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

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

// Serve React app for any non-API routes
app.MapFallbackToFile(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "app", "index.html"));

app.Run();
