/**
 * Core - French Translation
 *  >>> Warning: This file was auto-translated - Please contribute!
 * @author Jaime Pillora
 */
(function($) {
  $.verify.addUpdateRules({
    email: {
      message: "Adresse email invalide"
    },
    url: {
      message: "URL invalide"
    },
    alphanumeric: {
      message: "Utiliser des chiffres et des lettres seulement"
    },
    number: {
      message: "Utilisez uniquement des chiffres"
    },
    required: {
      messages: {
        all: "Ce champ est obligatoire",
        multiple: "S'il vous plaît choisir une option",
        single: "Cette case à cocher est nécessaire"
      }
    },
    regex: {
      message: "Format non valide"
    },
    min: {
      message: "Doit être au moins {{ min }} caractères"
    },
    max: {
      message: "Doit être dans la plupart des {{ max }} caractères"
    },
    size: {
      messages: {
        range: "Doit être compris entre {{ min }} et {{ max }} caractères",
        exact: "Doit être {{ min }} characters"
      }
    }
  });
})(jQuery);
