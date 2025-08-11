using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SpendingTracker_API.Migrations
{
    /// <inheritdoc />
    public partial class CategoryBudgetAndHistoryMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CategoryId",
                table: "Transaction",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "TransactionCategoryId",
                table: "Transaction",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Balance",
                table: "AppUser",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "NotBudgeted",
                table: "AppUser",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "Category",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FlagDel = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Category", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Category_AppUser_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Budget",
                columns: table => new
                {
                    CategoryId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BudgetAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FlagDel = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    OriginCategoryId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Budget", x => x.CategoryId);
                    table.ForeignKey(
                        name: "FK_Budget_AppUser_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Budget_Category_OriginCategoryId",
                        column: x => x.OriginCategoryId,
                        principalTable: "Category",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BudgetHistory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    BudgetId = table.Column<int>(type: "integer", nullable: false),
                    TransactionId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BudgetHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BudgetHistory_Budget_BudgetId",
                        column: x => x.BudgetId,
                        principalTable: "Budget",
                        principalColumn: "CategoryId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BudgetHistory_Transaction_TransactionId",
                        column: x => x.TransactionId,
                        principalTable: "Transaction",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Transaction_TransactionCategoryId",
                table: "Transaction",
                column: "TransactionCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_AppUser_Email",
                table: "AppUser",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Budget_OriginCategoryId",
                table: "Budget",
                column: "OriginCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Budget_UserId",
                table: "Budget",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetHistory_BudgetId",
                table: "BudgetHistory",
                column: "BudgetId");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetHistory_TransactionId",
                table: "BudgetHistory",
                column: "TransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_Category_Name_UserId",
                table: "Category",
                columns: new[] { "Name", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Category_UserId",
                table: "Category",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Transaction_Category_TransactionCategoryId",
                table: "Transaction",
                column: "TransactionCategoryId",
                principalTable: "Category",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transaction_Category_TransactionCategoryId",
                table: "Transaction");

            migrationBuilder.DropTable(
                name: "BudgetHistory");

            migrationBuilder.DropTable(
                name: "Budget");

            migrationBuilder.DropTable(
                name: "Category");

            migrationBuilder.DropIndex(
                name: "IX_Transaction_TransactionCategoryId",
                table: "Transaction");

            migrationBuilder.DropIndex(
                name: "IX_AppUser_Email",
                table: "AppUser");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "Transaction");

            migrationBuilder.DropColumn(
                name: "TransactionCategoryId",
                table: "Transaction");

            migrationBuilder.DropColumn(
                name: "Balance",
                table: "AppUser");

            migrationBuilder.DropColumn(
                name: "NotBudgeted",
                table: "AppUser");
        }
    }
}
