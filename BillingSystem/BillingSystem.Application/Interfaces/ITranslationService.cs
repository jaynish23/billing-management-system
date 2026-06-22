using System.Threading.Tasks;

namespace BillingSystem.Application.Interfaces
{
    public interface ITranslationService
    {
        Task<string> TranslateAsync(string text, string sourceLang, string targetLang);
    }
}
