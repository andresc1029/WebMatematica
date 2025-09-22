using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;
using System.Runtime.CompilerServices;
using System.Security.Cryptography.X509Certificates;

namespace WebMatematica.Pages
{
    public class loginModel : PageModel
    {
        [BindProperty]
        [Required]
        public string Usuario { get; set; }

        [BindProperty]
        [Required]
        public string Contraseña { get; set; }

        public List<(string Nombre, string Contraseña)> ListaUsuarios = new List<(string, string)>
        {
           ("Kevin", "1234"),
        };



        public void OnGet()
        {
           
        }

        public IActionResult OnPost()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            string usuarioIngresado = Usuario;
            string contraseñaIngresada = Contraseña;

            var usuarioValido = ListaUsuarios.Any(u =>
        u.Nombre == usuarioIngresado && u.Contraseña == contraseñaIngresada);

            if (usuarioValido)
            {
                return RedirectToPage("/PaginaPrincipal");
            }
            else
            {
                ModelState.AddModelError("", "Usuario o contraseña incorrectos");
                return Page();
            }
        } 
    }
}
