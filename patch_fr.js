const fs = require('fs');
const path = require('path');

const frPath = path.join(__dirname, 'src', 'lib', 'i18n', 'dictionaries', 'fr.json');

let fr = {};
try {
  fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));
} catch (e) {}

if (!fr.security) {
  fr.security = {
    "section_title": "Sécurité et Accès",
    "auth_logs": "Historique d'authentification",
    "ban_list": "Liste des bannissements",
    "auth_logs_title": "Historique d'authentification",
    "auth_logs_desc": "Afficher et filtrer les tentatives de connexion et d'enregistrement",
    "search_ip_identifier": "Rechercher une adresse IP, un identifiant ou un pays...",
    "status_all": "Tous les statuts",
    "status_success": "Succès",
    "status_failed": "Échoué",
    "status_blocked": "Bloqué",
    "status_rate_limit": "Limite de taux",
    "action_login": "Connexion",
    "action_register": "Inscription",
    "action_verify": "Vérification OTP",
    "col_date": "Date et heure",
    "col_action": "Action",
    "col_identifier": "Identifiant",
    "col_ip_country": "IP et Pays",
    "col_device": "Appareil",
    "col_status": "Statut",
    "no_logs": "Aucun historique trouvé",
    "ban_list_title": "Liste des bannissements",
    "ban_list_desc": "Gérer les adresses IP, pays, emails ou téléphones bloqués",
    "search_bans": "Rechercher un blocage...",
    "type_all": "Tous les types",
    "type_ip": "IP",
    "type_country": "Pays",
    "type_device": "Appareil",
    "type_email": "Email",
    "type_phone": "Téléphone",
    "add_ban": "Ajouter un bannissement",
    "col_target": "Cible",
    "col_type": "Type",
    "col_reason": "Raison",
    "col_expires": "Expire le",
    "col_created": "Date d'ajout",
    "col_actions": "Actions",
    "unban": "Débloquer",
    "edit": "Modifier",
    "add_ban_title": "Ajouter un nouveau bannissement",
    "ban_target": "Cible (Ex: 192.168.1.1 ou dz)",
    "ban_type": "Type de bannissement",
    "ban_reason": "Raison (optionnel)",
    "ban_duration": "Durée",
    "duration_1h": "1 Heure",
    "duration_24h": "24 Heures",
    "duration_1w": "1 Semaine",
    "duration_1m": "1 Mois",
    "duration_permanent": "Permanent",
    "cancel": "Annuler",
    "save": "Enregistrer le bannissement",
    "success_added": "Bannissement ajouté avec succès",
    "success_removed": "Bannissement supprimé avec succès"
  };
}

fs.writeFileSync(frPath, JSON.stringify(fr, null, 2), 'utf8');
console.log('fr.json updated.');
