using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BillingSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLedgerTransactionTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LedgerTransactions",
                columns: table => new
                {
                    TransactionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TransactionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MillNo = table.Column<int>(type: "int", nullable: false),
                    DukanNo = table.Column<int>(type: "int", nullable: false),
                    MarkoNo = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Vigat_en = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Vigat_hi = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Vigat_guj = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LedgerTransactions", x => x.TransactionId);
                    table.ForeignKey(
                        name: "FK_LedgerTransactions_UserDukans_DukanNo",
                        column: x => x.DukanNo,
                        principalTable: "UserDukans",
                        principalColumn: "DukanNo",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LedgerTransactions_UserMarkos_MarkoNo",
                        column: x => x.MarkoNo,
                        principalTable: "UserMarkos",
                        principalColumn: "MarkoNo",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LedgerTransactions_UserMills_MillNo",
                        column: x => x.MillNo,
                        principalTable: "UserMills",
                        principalColumn: "MillNo",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LedgerTransactions_DukanNo",
                table: "LedgerTransactions",
                column: "DukanNo");

            migrationBuilder.CreateIndex(
                name: "IX_LedgerTransactions_MarkoNo",
                table: "LedgerTransactions",
                column: "MarkoNo");

            migrationBuilder.CreateIndex(
                name: "IX_LedgerTransactions_MillNo",
                table: "LedgerTransactions",
                column: "MillNo");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LedgerTransactions");
        }
    }
}
