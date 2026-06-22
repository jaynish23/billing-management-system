using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BillingSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialAuthSync : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OtpInfoMst",
                columns: table => new
                {
                    OtpNo = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GeneratedOtp = table.Column<int>(type: "int", nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RecordedOnUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RecordedBy = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    IsUsed = table.Column<bool>(type: "bit", nullable: false),
                    OtpType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OtpInfoMst", x => x.OtpNo);
                });

            migrationBuilder.CreateTable(
                name: "Usermst",
                columns: table => new
                {
                    Uuserid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserNo = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    vfirstname = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    vlastname = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    vemailid = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    vpassword = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    MobileNumber = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    PreferredLanguage = table.Column<string>(type: "nvarchar(5)", maxLength: 5, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usermst", x => x.Uuserid);
                    table.UniqueConstraint("AK_Usermst_UserNo", x => x.UserNo);
                });

            migrationBuilder.CreateTable(
                name: "UserRoles",
                columns: table => new
                {
                    UserRoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserNo = table.Column<int>(type: "int", nullable: false),
                    RoleNo = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRoles", x => x.UserRoleId);
                    table.ForeignKey(
                        name: "FK_UserRoles_Usermst_UserNo",
                        column: x => x.UserNo,
                        principalTable: "Usermst",
                        principalColumn: "UserNo",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Usermst_MobileNumber",
                table: "Usermst",
                column: "MobileNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usermst_Username",
                table: "Usermst",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usermst_vemailid",
                table: "Usermst",
                column: "vemailid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_UserNo",
                table: "UserRoles",
                column: "UserNo");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OtpInfoMst");

            migrationBuilder.DropTable(
                name: "UserRoles");

            migrationBuilder.DropTable(
                name: "Usermst");
        }
    }
}
