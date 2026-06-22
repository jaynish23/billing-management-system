using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BillingSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStateToDistrict : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "StateNo",
                table: "UserDistricts",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserDistricts_StateNo",
                table: "UserDistricts",
                column: "StateNo");

            migrationBuilder.AddForeignKey(
                name: "FK_UserDistricts_UserStates_StateNo",
                table: "UserDistricts",
                column: "StateNo",
                principalTable: "UserStates",
                principalColumn: "StateNo");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserDistricts_UserStates_StateNo",
                table: "UserDistricts");

            migrationBuilder.DropIndex(
                name: "IX_UserDistricts_StateNo",
                table: "UserDistricts");

            migrationBuilder.DropColumn(
                name: "StateNo",
                table: "UserDistricts");
        }
    }
}
