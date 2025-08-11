using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpendingTracker_API.Migrations
{
    /// <inheritdoc />
    public partial class ChangeTransactionCategoryIdfromstringtoint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transaction_Category_TransactionCategoryId",
                table: "Transaction");

            migrationBuilder.DropIndex(
                name: "IX_Transaction_TransactionCategoryId",
                table: "Transaction");

            migrationBuilder.DropColumn(
                name: "TransactionCategoryId",
                table: "Transaction");

            migrationBuilder.AlterColumn<int>(
                name: "CategoryId",
                table: "Transaction",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.CreateIndex(
                name: "IX_Transaction_CategoryId",
                table: "Transaction",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Transaction_Category_CategoryId",
                table: "Transaction",
                column: "CategoryId",
                principalTable: "Category",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transaction_Category_CategoryId",
                table: "Transaction");

            migrationBuilder.DropIndex(
                name: "IX_Transaction_CategoryId",
                table: "Transaction");

            migrationBuilder.AlterColumn<string>(
                name: "CategoryId",
                table: "Transaction",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "TransactionCategoryId",
                table: "Transaction",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Transaction_TransactionCategoryId",
                table: "Transaction",
                column: "TransactionCategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Transaction_Category_TransactionCategoryId",
                table: "Transaction",
                column: "TransactionCategoryId",
                principalTable: "Category",
                principalColumn: "Id");
        }
    }
}
