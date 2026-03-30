# Newsletter gratuite (sans Brevo)

Cette configuration envoie automatiquement un email a chaque nouvelle mise a jour publiee, via GitHub Actions + SMTP Outlook/Microsoft 365.

## Principe

- Vous publiez comme d'habitude sur `main`.
- Si `updates.xml` (ou `index.html`) change, GitHub lance un workflow.
- Le workflow envoie un email automatique a la liste d'abonnes.

Aucun abonnement externe (Brevo/Feedly) n'est necessaire.

## 1) Ajouter les secrets GitHub

Dans le repository GitHub:

`Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`

Ajoutez:

- `NEWSLETTER_SMTP_USERNAME` : adresse Outlook/M365 qui envoie les emails (ex: `newsletter@votre-domaine.com`)
- `NEWSLETTER_SMTP_PASSWORD` : mot de passe du compte SMTP (ou mot de passe d'application si requis)
- `NEWSLETTER_TO` : liste des destinataires, separes par virgules

Exemple `NEWSLETTER_TO`:

`prenom1@domaine.com,prenom2@domaine.com,prenom3@domaine.com`

## 2) Publier une mise a jour

1. Ajouter/modifier la carte de mise a jour dans `index.html`
2. Ajouter l'item correspondant en tete de `updates.xml`
3. Commit + push sur `main`

Le workflow `.github/workflows/newsletter-updates.yml` s'executera et enverra l'email.

## 3) Test rapide

- Faites une petite modification dans `updates.xml`
- Push sur `main`
- Verifiez `Actions` dans GitHub
- Confirmez la reception de l'email

## Remarques

- Cette solution est gratuite cote outils externes.
- Le cout eventuel depend uniquement de votre licence Microsoft 365 existante.
- Si SMTP est bloque, il faut autoriser SMTP AUTH sur la boite d'envoi.
