using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BillingSystem.Application.DTOs;
using BillingSystem.Application.Interfaces;
using BillingSystem.Application.Interfaces.Repositories;
using BillingSystem.Application.Interfaces.Services;
using BillingSystem.Domain.Entities;

namespace BillingSystem.Application.Services
{
    public class LedgerTransactionService : ILedgerTransactionService
    {
        private readonly ILedgerTransactionRepository _repository;
        private readonly ITranslationService _translationService;
        private readonly ICurrentUser _currentUser;

        public LedgerTransactionService(
            ILedgerTransactionRepository repository,
            ITranslationService translationService,
            ICurrentUser currentUser)
        {
            _repository = repository;
            _translationService = translationService;
            _currentUser = currentUser;
        }

        private LedgerTransactionDto MapToDto(LedgerTransaction t, string language)
        {
            return new LedgerTransactionDto
            {
                TransactionId = t.TransactionId,
                TransactionDate = t.TransactionDate,
                MillNo = t.MillNo,
                MillName = language == "hi" ? t.UserMill?.MillName_hi : (language == "gu" || language == "guj" ? t.UserMill?.MillName_guj : t.UserMill?.MillName_en),
                DukanNo = t.DukanNo,
                DukanName = language == "hi" ? t.UserDukan?.DukanName_hi : (language == "gu" || language == "guj" ? t.UserDukan?.DukanName_guj : t.UserDukan?.DukanName_en),
                MarkoNo = t.MarkoNo,
                MarkoName = language == "hi" ? t.UserMarko?.MarkoName_hi : (language == "gu" || language == "guj" ? t.UserMarko?.MarkoName_guj : t.UserMarko?.MarkoName_en),
                Quantity = t.Quantity,
                Vigat = language == "hi" ? t.Vigat_hi : (language == "gu" || language == "guj" ? t.Vigat_guj : t.Vigat_en),
                IsActive = t.IsActive
            };
        }

        public async Task<IEnumerable<LedgerTransactionDto>> GetTransactionsByMillAsync(int millNo, string language)
        {
            var transactions = await _repository.GetByMillNoAsync(millNo);
            return transactions.Select(t => MapToDto(t, language));
        }

        public async Task<IEnumerable<LedgerTransactionDto>> GetTransactionsByDukanAsync(int dukanNo, string language)
        {
            var transactions = await _repository.GetByDukanNoAsync(dukanNo);
            return transactions.Select(t => MapToDto(t, language));
        }

        public async Task<LedgerTransactionDto> GetTransactionByIdAsync(int transactionId, string language)
        {
            var t = await _repository.GetByIdAsync(transactionId);
            if (t == null) throw new Exception("Transaction not found");
            return MapToDto(t, language);
        }

        public async Task<LedgerTransactionDto> CreateTransactionAsync(LedgerTransactionDto dto)
        {
            var transaction = new LedgerTransaction
            {
                TransactionDate = dto.TransactionDate,
                MillNo = dto.MillNo,
                DukanNo = dto.DukanNo,
                MarkoNo = dto.MarkoNo,
                Quantity = dto.Quantity,
                CreatedBy = _currentUser.UserId,
                CreatedDate = DateTime.UtcNow,
                IsActive = dto.IsActive
            };

            await PopulateVigatAsync(transaction, dto.Vigat, dto.InputLanguage);

            var created = await _repository.AddAsync(transaction);
            dto.TransactionId = created.TransactionId;
            return dto;
        }

        public async Task UpdateTransactionAsync(int transactionId, LedgerTransactionDto dto)
        {
            var transaction = await _repository.GetByIdAsync(transactionId);
            if (transaction == null) throw new Exception("Transaction not found");

            transaction.TransactionDate = dto.TransactionDate;
            transaction.MillNo = dto.MillNo;
            transaction.DukanNo = dto.DukanNo;
            transaction.MarkoNo = dto.MarkoNo;
            transaction.Quantity = dto.Quantity;
            transaction.IsActive = dto.IsActive;
            transaction.UpdatedBy = _currentUser.UserId;
            transaction.UpdatedDate = DateTime.UtcNow;

            await PopulateVigatAsync(transaction, dto.Vigat, dto.InputLanguage);

            await _repository.UpdateAsync(transaction);
        }

        public async Task DeleteTransactionAsync(int transactionId)
        {
            await _repository.SoftDeleteAsync(transactionId);
        }

        private async Task PopulateVigatAsync(LedgerTransaction transaction, string vigat, string inputLanguage)
        {
            if (string.IsNullOrWhiteSpace(vigat))
            {
                transaction.Vigat_en = null;
                transaction.Vigat_hi = null;
                transaction.Vigat_guj = null;
                return;
            }

            if (inputLanguage == "en")
            {
                transaction.Vigat_en = vigat;
                transaction.Vigat_hi = await _translationService.TranslateAsync(vigat, "en", "hi");
                transaction.Vigat_guj = await _translationService.TranslateAsync(vigat, "en", "gu");
            }
            else if (inputLanguage == "hi")
            {
                transaction.Vigat_hi = vigat;
                transaction.Vigat_en = await _translationService.TranslateAsync(vigat, "hi", "en");
                transaction.Vigat_guj = await _translationService.TranslateAsync(vigat, "hi", "gu");
            }
            else if (inputLanguage == "gu" || inputLanguage == "guj")
            {
                transaction.Vigat_guj = vigat;
                transaction.Vigat_en = await _translationService.TranslateAsync(vigat, "gu", "en");
                transaction.Vigat_hi = await _translationService.TranslateAsync(vigat, "gu", "hi");
            }
        }
    }
}
