# Newsletter avec admin prive

Cette configuration envoie automatiquement un email quand vous mettez a jour l'onglet 8.
Le pilotage admin est prive: il se fait dans GitHub (variables/secrets), pas dans un fichier public du site.

## Principe

- Le public voit uniquement le formulaire d'abonnement.
- Vous gardez les parametres admin dans GitHub `Settings`.
- A chaque `push` sur `main` avec changement de `index.html` ou `updates.xml`, le workflow envoie la newsletter.
- Le contenu email est construit depuis la premiere carte `release-card` de l'onglet 8 (fallback RSS si besoin).

## 1) Configurer les secrets GitHub

Dans le repository GitHub:

`Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`

Ajoutez:

- `BREVO_API_KEY` : cle API Brevo (obligatoire)

## 2) Configurer les variables admin privees

Dans GitHub:

`Settings` -> `Secrets and variables` -> `Actions` -> `Variables` -> `New repository variable`

Variables recommandees:

- `NEWSLETTER_ENABLED` : `true` ou `false`
- `NEWSLETTER_AUTO_SEND_ON_PUSH` : `true` ou `false`
- `NEWSLETTER_SENDER_NAME` : ex `Finke CRM`
- `NEWSLETTER_SENDER_EMAIL` : email expediteur valide
- `NEWSLETTER_LIST_ID` : ID numerique de la liste Brevo

Variables optionnelles:

- `NEWSLETTER_SUBJECT_TEMPLATE` : ex `[Guide CRM] {{title}}`
- `NEWSLETTER_HTML_TEMPLATE` : template HTML (supporte `{{title}}`, `{{description}}`, `{{updateLink}}`, `{{guideLink}}`, `{{highlightsHtml}}`)

Compatibilite ancienne config:

- `BREVO_SENDER_EMAIL` et `BREVO_LIST_ID` restent acceptes en fallback.

## 3) Formulaire public d'abonnement

Le formulaire dans `index.html` utilise l'attribut:

- `data-brevo-form-url` sur `#newsletter-subscribe-form`

Mettez ici votre URL de formulaire Brevo publiee.

Si vide, le script tente un fallback via le SDK Brevo present sur la page.

## 4) Publier une mise a jour

1. Modifier la premiere carte de nouveaute dans l'onglet 8 de `index.html`
2. Mettre a jour l'item en tete de `updates.xml`
3. Commit + push sur `main`

Le workflow `.github/workflows/newsletter-updates.yml` enverra la campagne automatiquement.

## 5) Envoi manuel (admin)

Depuis `Actions` -> workflow `Newsletter admin pipeline` -> `Run workflow`:

- `force_send=true` pour envoyer meme si auto-send est desactive
- `custom_subject` et `custom_html` pour override ponctuel
