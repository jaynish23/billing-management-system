using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BillingSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserMillTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserMills",
                columns: table => new
                {
                    MillNo = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MillName_en = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    MillName_hi = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    MillName_guj = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    OwnerName_en = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    OwnerName_hi = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    OwnerName_guj = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    OwnerPhoneNo = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    Location_en = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Location_hi = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Location_guj = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    DistrictNo = table.Column<int>(type: "int", nullable: false),
                    StateNo = table.Column<int>(type: "int", nullable: false),
                    MillTaxInfo = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserMills", x => x.MillNo);
                    table.ForeignKey(
                        name: "FK_UserMills_UserDistricts_DistrictNo",
                        column: x => x.DistrictNo,
                        principalTable: "UserDistricts",
                        principalColumn: "DistrictNo",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserMills_UserStates_StateNo",
                        column: x => x.StateNo,
                        principalTable: "UserStates",
                        principalColumn: "StateNo",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserMills_DistrictNo",
                table: "UserMills",
                column: "DistrictNo");

            migrationBuilder.CreateIndex(
                name: "IX_UserMills_StateNo",
                table: "UserMills",
                column: "StateNo");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserMills");
        }
    }
}
