using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BillingSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Phase2Entities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuditTableMsts",
                columns: table => new
                {
                    AuditId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TableName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RecordNo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ActionType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    OldValue = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewValue = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserNo = table.Column<int>(type: "int", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditTableMsts", x => x.AuditId);
                });

            migrationBuilder.CreateTable(
                name: "UserDistricts",
                columns: table => new
                {
                    DistrictNo = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DistrictName_en = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DistrictCode_en = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DistrictDescription_en = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    DistrictName_hi = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DistrictCode_hi = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DistrictDescription_hi = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    DistrictName_guj = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DistrictCode_guj = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DistrictDescription_guj = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserDistricts", x => x.DistrictNo);
                });

            migrationBuilder.CreateTable(
                name: "UserLoginDetails",
                columns: table => new
                {
                    LoginId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UserNo = table.Column<int>(type: "int", nullable: true),
                    LoginTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LogoutTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActiveSession = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserLoginDetails", x => x.LoginId);
                });

            migrationBuilder.CreateTable(
                name: "UserMasterPages",
                columns: table => new
                {
                    MasterPageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MasterPageNo = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MasterPageName_en = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    MasterPageName_hi = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    MasterPageName_guj = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RouteUrl = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    nRecordedBy = table.Column<int>(type: "int", nullable: true),
                    dCreatedOnDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserMasterPages", x => x.MasterPageId);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditTableMsts");

            migrationBuilder.DropTable(
                name: "UserDistricts");

            migrationBuilder.DropTable(
                name: "UserLoginDetails");

            migrationBuilder.DropTable(
                name: "UserMasterPages");
        }
    }
}
