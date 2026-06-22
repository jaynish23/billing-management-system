using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BillingSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MultiTenancyIsolation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserStates_StateCode",
                table: "UserStates");

            migrationBuilder.DropIndex(
                name: "IX_UserDistricts_DistrictCode",
                table: "UserDistricts");

            migrationBuilder.CreateIndex(
                name: "IX_UserStates_StateCode_CreatedBy",
                table: "UserStates",
                columns: new[] { "StateCode", "CreatedBy" },
                unique: true,
                filter: "[StateCode] IS NOT NULL AND [CreatedBy] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_UserDistricts_DistrictCode_CreatedBy",
                table: "UserDistricts",
                columns: new[] { "DistrictCode", "CreatedBy" },
                unique: true,
                filter: "[DistrictCode] IS NOT NULL AND [CreatedBy] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserStates_StateCode_CreatedBy",
                table: "UserStates");

            migrationBuilder.DropIndex(
                name: "IX_UserDistricts_DistrictCode_CreatedBy",
                table: "UserDistricts");

            migrationBuilder.CreateIndex(
                name: "IX_UserStates_StateCode",
                table: "UserStates",
                column: "StateCode",
                unique: true,
                filter: "[StateCode] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_UserDistricts_DistrictCode",
                table: "UserDistricts",
                column: "DistrictCode",
                unique: true,
                filter: "[DistrictCode] IS NOT NULL");
        }
    }
}
