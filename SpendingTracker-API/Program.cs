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

var builder = WebApplication.CreateBuilder(args);

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
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = "SmartScheme";
    options.DefaultChallengeScheme = "SmartScheme";
})
.AddPolicyScheme("SmartScheme", "Smart Scheme", policy =>
{
    // Switch between JWT and Cookie authentication based on the request context
    policy.ForwardDefaultSelector = context =>
    {
        var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
        return !string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ")
            ? JwtBearerDefaults.AuthenticationScheme
            : CookieAuthenticationDefaults.AuthenticationScheme;
    };
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
})
.AddCookie(CookieAuthenticationDefaults.AuthenticationScheme);

builder.Services.AddAuthorization(options =>
{
    options.DefaultPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

// Configure cookie policy options
builder.Services.Configure<CookiePolicyOptions>(options =>
{
    options.MinimumSameSitePolicy = SameSiteMode.None;
    options.Secure = CookieSecurePolicy.Always;
});

const string DevServerPolicyName = "DevServerPolicyName";
// Configure CORS policy to allow requests from the frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy(DevServerPolicyName, policy =>
    {
        policy.WithOrigins("http://localhost:5173") // your React dev server
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

// Trust proxy headers for forwarded headers
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost
});

app.UseCookiePolicy();

app.UseCors(DevServerPolicyName);

//app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

// Serve static files from wwwroot
app.UseStaticFiles();

app.MapControllers();

app.MapRazorPages();

app.Run();
