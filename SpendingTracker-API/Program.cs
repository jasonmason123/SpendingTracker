using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SpendingTracker_API.Context;
using SpendingTracker_API.Entities;
using SpendingTracker_API.Repositories.AppUserRepository;
using SpendingTracker_API.Repositories.TransactionRepository;
using SpendingTracker_API.Repositories.UnitOfWork;
using SpendingTracker_API.Utils.UserRetriever;

var builder = WebApplication.CreateBuilder(args);

// Add configurations.
builder.Configuration.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
builder.Configuration.AddEnvironmentVariables();

// Add services to the container.
builder.Services.AddScoped<IAppUnitOfWork, EfUnitOfWork>();
builder.Services.AddScoped<ITransactionRepository, EfTransactionRepository>();
builder.Services.AddScoped<IAppUserRepository, EfAppUserRepository>();
builder.Services.AddScoped<IUserRetriever, UserRetriever>();

// Add HttpContextAccessor to access the current user context
builder.Services.AddHttpContextAccessor();

// Add db context
var connectionString = ""; //Get connection string from environment variable

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Add Identity services
builder.Services.AddIdentity<AppUser, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddControllers();
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

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
