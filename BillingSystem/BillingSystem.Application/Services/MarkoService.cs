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
    public class MarkoService : IMarkoService
    {
        private readonly IMarkoRepository _markoRepository;
        private readonly ITranslationService _translationService;

        public MarkoService(IMarkoRepository markoRepository, ITranslationService translationService)
        {
            _markoRepository = markoRepository;
            _translationService = translationService;
        }

        public async Task<(IEnumerable<MarkoDto> markos, int totalCount)> GetPagedMarkosAsync(int pageNumber, int pageSize, string language)
        {
            var markos = await _markoRepository.GetPagedAsync(pageNumber, pageSize, language);
            var totalCount = await _markoRepository.GetTotalCountAsync();

            var list = markos.Select(m => MapToDto(m, language)).ToList();
            return (list, totalCount);
        }

        public async Task<MarkoDto> GetMarkoByIdAsync(int markoNo, string language)
        {
            var marko = await _markoRepository.GetByIdAsync(markoNo);
            if (marko == null) return null;
            return MapToDto(marko, language);
        }

        public async Task<MarkoDto> CreateMarkoAsync(MarkoDto markoDto)
        {
            var finalLanguage = markoDto.InputLanguage ?? "en";
            
            var userMarko = new UserMarko
            {
                MillNo = markoDto.MillNo,
                IsActive = markoDto.IsActive
            };

            if (finalLanguage == "en")
            {
                userMarko.MarkoName_en = markoDto.MarkoName;
            }
            else if (finalLanguage == "hi")
            {
                userMarko.MarkoName_hi = markoDto.MarkoName;
            }
            else if (finalLanguage == "gu" || finalLanguage == "guj")
            {
                userMarko.MarkoName_guj = markoDto.MarkoName;
                finalLanguage = "gu"; 
            }

            await TranslateMissingFieldsAsync(userMarko, finalLanguage);

            var created = await _markoRepository.AddAsync(userMarko);
            return MapToDto(created, finalLanguage);
        }

        public async Task UpdateMarkoAsync(int markoNo, MarkoDto markoDto)
        {
            var existingMarko = await _markoRepository.GetByIdAsync(markoNo);
            if (existingMarko == null) return;

            var finalLanguage = markoDto.InputLanguage ?? "en";
            if (finalLanguage == "guj") finalLanguage = "gu";

            if (finalLanguage == "en")
            {
                existingMarko.MarkoName_en = markoDto.MarkoName;
            }
            else if (finalLanguage == "hi")
            {
                existingMarko.MarkoName_hi = markoDto.MarkoName;
            }
            else if (finalLanguage == "gu")
            {
                existingMarko.MarkoName_guj = markoDto.MarkoName;
            }

            existingMarko.MillNo = markoDto.MillNo;
            existingMarko.IsActive = markoDto.IsActive;
            existingMarko.UpdatedDate = DateTime.UtcNow;

            await TranslateMissingFieldsAsync(existingMarko, finalLanguage);
            await _markoRepository.UpdateAsync(existingMarko);
        }

        public async Task DeleteMarkoAsync(int markoNo)
        {
            await _markoRepository.SoftDeleteAsync(markoNo);
        }

        private async Task TranslateMissingFieldsAsync(UserMarko marko, string inputLanguage)
        {
            try
            {
                if (inputLanguage == "en")
                {
                    marko.MarkoName_hi = await _translationService.TranslateAsync(marko.MarkoName_en, "en", "hi");
                    marko.MarkoName_guj = await _translationService.TranslateAsync(marko.MarkoName_en, "en", "gu");
                }
                else if (inputLanguage == "hi")
                {
                    marko.MarkoName_en = await _translationService.TranslateAsync(marko.MarkoName_hi, "hi", "en");
                    marko.MarkoName_guj = await _translationService.TranslateAsync(marko.MarkoName_hi, "hi", "gu");
                }
                else if (inputLanguage == "gu")
                {
                    marko.MarkoName_en = await _translationService.TranslateAsync(marko.MarkoName_guj, "gu", "en");
                    marko.MarkoName_hi = await _translationService.TranslateAsync(marko.MarkoName_guj, "gu", "hi");
                }
            }
            catch
            {
                if (string.IsNullOrEmpty(marko.MarkoName_en)) marko.MarkoName_en = marko.MarkoName_hi ?? marko.MarkoName_guj;
                if (string.IsNullOrEmpty(marko.MarkoName_hi)) marko.MarkoName_hi = marko.MarkoName_en ?? marko.MarkoName_guj;
                if (string.IsNullOrEmpty(marko.MarkoName_guj)) marko.MarkoName_guj = marko.MarkoName_en ?? marko.MarkoName_hi;
            }
        }

        private MarkoDto MapToDto(UserMarko entity, string language)
        {
            var dto = new MarkoDto
            {
                MarkoNo = entity.MarkoNo,
                MillNo = entity.MillNo,
                IsActive = entity.IsActive,
                InputLanguage = language
            };

            if (language == "gu" || language == "guj")
            {
                dto.MarkoName = entity.MarkoName_guj ?? entity.MarkoName_en;
            }
            else if (language == "hi")
            {
                dto.MarkoName = entity.MarkoName_hi ?? entity.MarkoName_en;
            }
            else
            {
                dto.MarkoName = entity.MarkoName_en;
            }

            if (entity.UserMill != null)
            {
                dto.MillName = ResolveMillName(entity.UserMill, language);
            }

            return dto;
        }

        private string ResolveMillName(UserMill mill, string selectedLang)
        {
            if (selectedLang == "gu" || selectedLang == "guj")
                return mill.MillName_guj ?? mill.MillName_en;
            if (selectedLang == "hi")
                return mill.MillName_hi ?? mill.MillName_en;
            return mill.MillName_en;
        }
    }
}
