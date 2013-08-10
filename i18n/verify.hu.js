/** 
 * internationalization - i18n
 * English template
 */
window.verifyMessages = window.verifyMessages || {};
(function ($){
  window.verifyMessages = $.extend(window.verifyMessages, {
    currency: "Nem valódi pénznem",
    email: "Nem valódi e-mail cím",
    url: "A megadott érték nem valódi URL",
    alphanumeric: "Csak számok és betűk lehetnek",
    street_number: "A megadott érték nem házszám",
    number: "A megadott érték nem szám",
    numberSpace: "Csak szóközök és számok használata lehetséges",
    postcode: "Érvénytelen irányítószám",
    date: {
      invalid: "Érvénytelen dátum",
      start: "Érvénytelen kezdő dátum",
      end: "Érvénytelen befejező dátum",
      startEnd: "A dátumnak hamarabb kell kezdődnie mielőtt befejeződik"
    },
    required: {
      all: "A mező kitöltése kötelező",
      multiple: "Kérem válasszon",
      single: "A mező kiválasztása kötelező"
    },
    regex: "Érvénytelen formátum",
    phone: [
      "Csak szóközök és számok használata lehetséges",
      "A számnak 0-val kell kezdődnie",
      "10 számjegy hosszúnak kell lennie"
    ],
    size: [
      "Az érték nem %s karakter hosszú",
      "A megadott értéknek %s és %s karakter között kell lennie"
    ],
    min: "Az érték kevesebb, mint a megengedett %s karakter",
    max: "Az érték több, mint a megengedett % karakter",
    decimal: "Érvénytelen szám",
    minVal: "Az értéknek többnek kell lennie, mint %s",
    maxVal: "Az értéknek kevesebbnek kell lennie, mint %s",
    rangeVal: "Az értéknek %s és %s között kell lennie",
    agreement: "Ahhoz, hogy folytathassa el kell fogadnia",
    minAge: "Ön még nem múlt el %s éves",
    compare: "A megadott érték nem egyezik meg a %s mezőben megadottakkal",
    check: "A megadott érték már használatban van"
  });
})(window.jQuery);