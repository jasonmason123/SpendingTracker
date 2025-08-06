using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Localization;
using SpendingTracker_API.Resources.Pages;

namespace SpendingTracker_API.Pages
{
    public class IndexModel : PageModel
    {
        private readonly IStringLocalizer<SharedResources> SharedLocalizer;

        public IndexModel(IStringLocalizer<SharedResources> sharedLocalizer)
        {
            SharedLocalizer = sharedLocalizer;
        }

        public IActionResult OnGet()
        {
            Console.WriteLine("User: " + User.Identity.ToString());
            foreach(var claim in User.Claims)
            {
                Console.WriteLine("Claim: " + claim.Value);
            }
            if (User.Identity?.IsAuthenticated == true)
            {
                return Redirect("/app");
            }

            return Page(); // Show landing page to guests
        }
    }
}
