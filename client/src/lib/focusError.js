// Après un envoi refusé : focus sur le premier champ en erreur (son message, relié par
// aria-describedby, est alors lu par le lecteur d'écran), sinon sur l'erreur globale.
export function focusFirstError(form) {
  // Laisse React afficher les erreurs avant de chercher le champ.
  requestAnimationFrame(() => {
    form?.querySelector('[aria-invalid="true"], [role="alert"]')?.focus();
  });
}
