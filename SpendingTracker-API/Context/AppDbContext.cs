using Microsoft.EntityFrameworkCore;
using SpendingTracker_API.Entities;

namespace SpendingTracker_API.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // DbSet properties for your entities
        public DbSet<AppUser> AppUsers { get; set; }
        public DbSet<Transaction> Transactions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Add any additional model configurations here

            modelBuilder.Entity<AppUser>()
                .HasIndex(u => u.Email)
                .IsUnique();
        }
    }
}
