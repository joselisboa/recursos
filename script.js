//
// Recursos aka 'Fichas de Rendimento' database using jQuery Bar, FrontgateJS, and Situs PHP Framework
//
// Description: Prototype Interface for a (BD) School Project
// Author: José Vieira Lisboa
// E-mail: jose.vieira.lisboa@gmail.com
// Webpage: https://situs.pt/recursos
//

$.ajaxSetup({ cache: true });

$.getScript("https://situs.pt/frontgate/and/router", function() {
    // start Frontgate hash router
    Frontgate.router.start();

    // load files
    (new Frontgate.Location({ hostname: "situs.pt", protocol:  "https:" }))
    .sync("lib/jquery-ui", "lib/topzindex", "lib/panel", "lib/_", "lib/bar", function(script) {
        Frontgate.script("fichas.js");
    });
});
