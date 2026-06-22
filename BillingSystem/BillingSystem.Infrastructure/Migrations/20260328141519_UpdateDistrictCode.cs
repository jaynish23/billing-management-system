using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BillingSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDistrictCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DistrictCode_en",
                table: "UserDistricts");

            migrationBuilder.DropColumn(
                name: "DistrictCode_guj",
                table: "UserDistricts");

            migrationBuilder.RenameColumn(
                name: "DistrictCode_hi",
                table: "UserDistricts",
                newName: "DistrictCode");

            migrationBuilder.CreateIndex(
                name: "IX_UserDistricts_DistrictCode",
                table: "UserDistricts",
                column: "DistrictCode",
                unique: true,
                filter: "[DistrictCode] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserDistricts_DistrictCode",
                table: "UserDistricts");

            migrationBuilder.RenameColumn(
                name: "DistrictCode",
                table: "UserDistricts",
                newName: "DistrictCode_hi");

            migrationBuilder.AddColumn<string>(
                name: "DistrictCode_en",
                table: "UserDistricts",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DistrictCode_guj",
                table: "UserDistricts",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }
    }
}
