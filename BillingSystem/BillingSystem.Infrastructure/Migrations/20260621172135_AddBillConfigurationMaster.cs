using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BillingSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBillConfigurationMaster : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BillConfiguration",
                columns: table => new
                {
                    BillConfigurationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserNo = table.Column<int>(type: "int", nullable: false),
                    GSTNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    BankAccountNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PANNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    LeftImagePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    RightImagePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    QRCodeImagePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BillConfiguration", x => x.BillConfigurationId);
                    table.ForeignKey(
                        name: "FK_BillConfiguration_Usermst_UserNo",
                        column: x => x.UserNo,
                        principalTable: "Usermst",
                        principalColumn: "UserNo",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BillConfiguration_UserNo",
                table: "BillConfiguration",
                column: "UserNo");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BillConfiguration");
        }
    }
}
