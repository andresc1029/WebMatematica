using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;
using System.Runtime.CompilerServices;
using System.Security.Cryptography.X509Certificates;

namespace WebMatematica.Pages
{
    public class loginModel : PageModel
    {
        public IActionResult OnGet()
        {
            var token = Request.Cookies["jwt"];
            if (!string.IsNullOrEmpty(token))
            {
                // Redirige antes de renderizar la página
                return RedirectToPage("/PaginaPrincipal");
            }

            return Page();
        }

    }
}
