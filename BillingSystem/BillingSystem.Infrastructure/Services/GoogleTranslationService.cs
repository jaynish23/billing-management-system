using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using BillingSystem.Application.Interfaces;

namespace BillingSystem.Infrastructure.Services
{
    public class GoogleTranslationService : ITranslationService
    {
        private readonly HttpClient _httpClient;
        
        // Optional safety threshold
        private static int _monthlyCharacterCount = 0;
        private const int CharacterLimitThreshold = 450000;

        public GoogleTranslationService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<string> TranslateAsync(string text, string sourceLang, string targetLang)
        {
            if (string.IsNullOrWhiteSpace(text)) return text;
            
            // Check threshold
            if (_monthlyCharacterCount + text.Length > CharacterLimitThreshold)
            {
                // Fallback to original text if limit reached
                return text;
            }

            try
            {
                var url = $"https://translate.googleapis.com/translate_a/single?client=gtx&sl={sourceLang}&tl={targetLang}&dt=t&q={Uri.EscapeDataString(text)}";

                var response = await _httpClient.GetAsync(url);
                if (response.IsSuccessStatusCode)
                {
                    _monthlyCharacterCount += text.Length;

                    var jsonString = await response.Content.ReadAsStringAsync();
                    using var document = JsonDocument.Parse(jsonString);
                    var root = document.RootElement;
                    
                    if (root.ValueKind == JsonValueKind.Array && root.GetArrayLength() > 0)
                    {
                        var firstItem = root[0];
                        if (firstItem.ValueKind == JsonValueKind.Array && firstItem.GetArrayLength() > 0)
                        {
                            var translatedText = firstItem[0][0].GetString();
                            return translatedText ?? text;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // Swallow exceptions so that the save process does not break
                throw ex;
            }

            // Fallback
            return text;
        }
    }
}
