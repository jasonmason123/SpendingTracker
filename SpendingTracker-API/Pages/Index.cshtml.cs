using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Localization;
using SpendingTracker_API.Resources.Pages;
using SpendingTracker_API.Utils;

namespace SpendingTracker_API.Pages
{
    public class IndexModel : PageModel
    {
        private readonly IStringLocalizer<SharedResources> SharedLocalizer;

        public IndexModel(IStringLocalizer<SharedResources> sharedLocalizer)
        {
            SharedLocalizer = sharedLocalizer;
        }

        public async Task<IActionResult> OnGet()
        {
            var result = await HttpContext.AuthenticateAsync(AuthSchemes.WEB_AUTH_SCHEME);

            if (result.Succeeded && result.Principal != null)
            {
                return Redirect("/app");
            }

            return Page(); // Show landing page to guests
        }
    }
}
