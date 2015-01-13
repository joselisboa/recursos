//
// Recursos aka 'Fichas de Rendimento' database using jQuery Bar, FrontgateJS, and Situs PHP Framework
//
// Description: Prototype Interface for a (BD) School Project
// Author: José Vieira Lisboa
// E-mail: jose.vieira.lisboa@gmail.com
// Webpage: https://situs.pt/recursos
//

(function(fichas) {

    // load toolbar
    Frontgate.sync("toolbar.js", "app.js", function() {
        $("#D1").attr({
            min: "2000-01-01",
            max: Frontgate.Apps(fichas.toolbar.name).hoje()
        });

        Frontgate.Apps("Fichas").data = fichas;

        // Retrieve existing user
        var user = JSON.parse(localStorage.getItem("user"));
        if (user != undefined) Frontgate.Apps("Fichas").start(user);//console.log("USER", user);
        // load current location route
        //else Frontgate.router.route(location.hash);
    });

})({
    toolbar: {
        name: "Fichas",
        items: [{
                html: '<img style="vertical-align: middle;" width="32" src="images/cash.png"> Fichas de Rendimento'
            },
            {
                html: '<img style="vertical-align: middle;" src="icons/16/user.png"> <span id="user"></span>',
                attr: { id: "user-a" },
                css: {
                    "font-size":"14px",
                    color:"rgba(0,0,0,.5)"
                }
        }],
        callback: function(bar, toolbar) {
            this.bar = bar;
            console.log('Frontgate.Apps("Fichas").user()', Frontgate.Apps("Fichas").user());
            $("#user-a").parent().css("float","right");
        }
    },
    toolboxes: {
        recursos: {
            toolbox: {
                name: "Recursos",
                items: [{
                    html: '<img src="icons/16/document.png"> Novo Recurso',
                    css: { cursor: "pointer" },
                    attr: { href: "#Recursos/novo" }
                },
                {
                    html: '<img src="icons/16/lightning.png"> Aplicar',
                    css: { cursor: "pointer" },
                    attr: {
                        href: "#Recursos/atualizar/RECURSO_ID/NOME,UNIDADE_CODIGO,TIPO_CODIGO"
                    }
                },
                {
                    html: '<img src="icons/16/close.png"> Eliminar',
                    css: { cursor: "pointer" },
                    attr: {
                        href: "#Recursos/delete/RECURSO_ID/NOME"
                    }
                },
                {
                    html: '<img src="icons/16/search.png"> Procurar',
                    css: { cursor: "pointer", display: "none" },
                    attr: { href: "#Recursos/search/NOME", "class": "search" }
                },
                {
                    html: '<img src="icons/16/add.png"> Adicionar Preço',
                    css: { display: "none", cursor: "pointer" },
                    attr: { id: "adicionar-preco", href: "#Recursos/adicionar-preco" }
                },
                {
                    html: '<img src="icons/16/add.png"> Adicionar Rendimento',
                    css: { display: "none", cursor: "pointer" },
                    attr: { id: "adicionar-rendimento", href: "#Recursos/adicionar-rendimento" }
                },
                {
                    html: '<img src="icons/16/eye.png"> Atributos Privados',
                    css: { cursor: "pointer" },
                    attr: { href: "#Recursos/private" }
                },
                {
                    text: "cancel-add-preco",
                    attr: { id: "cancel-add-preco" },
                    css: { display: "none" },
                    attr: { href: "#Recursos/cancel" }
                }]
            },
            // callback de recursos
            callback: function(bar, toolbox) {
                Frontgate.router.on("#Recursos/tabela", function(route) {
                    toolbox.tabela();
                });

                toolbox.entity("RECURSO", function () {
                    // estado inicial dos campos
                    toolbox.private(["RECURSO_PRECO", "FORNECEDOR_ID", "USER", "DATA_ATUALIZADO", "RECURSO_ID"])
                        .placeholder({ RECURSO_ID: "#", NOME: "Nome", RECURSO_PRECO: "€" });

                    $("#RECURSO-DATA_ATUALIZADO").attr({
                        "min": "2015-01-01",
                        "max": "2015-12-31",
                        "type": "date"
                    });

                    // lista de tipos
                    $("#RECURSO-TIPO_CODIGO").html(_.template($("#template-TIPO-option").html(), {
                        items: Fichas.fichas.FICHAS.Tables.TIPO
                    }));

                    // lista de unidades
                    $("#RECURSO-UNIDADE_CODIGO").html(_.template($("#template-UNIDADE-option").html(), {
                        items: Fichas.fichas.FICHAS.Tables.UNIDADE
                    }));

                    // create event: select recurso on table row
                    toolbox.on("tableRows", function (rows) {

                        var update_composto = function (row) {
                            var recurso = Fichas.fichas.recurso(row);
                            var url = "rendimento/" + recurso.recurso_id;
                            Fichas.fichas.recursos(url, function (json) {

                                if (!json.recurso) return console.error(url, json);

                                if (recurso.recurso_preco != json.recurso.RECURSO_PRECO) {
                                    //console.error(recurso.recurso_preco + " ---> " + json.recurso.RECURSO_PRECO);

                                    //*/ UPDATE RECURSO PRECO
                                    $(row).find("li.RECURSO-RECURSO_PRECO").text(json.recurso.RECURSO_PRECO).css("color", "green");;

                                    /*/
                                    var url = "execute/UPDATE RECURSO SET RECURSO_PRECO = " + json.recurso.RECURSO_PRECO + " WHERE RECURSO_ID = " + recurso.recurso_id;
                                    Fichas.fichas.recursos(url, function (json) {
                                        if (json !== true) console.error(url, json);
                                        //Frontgate.router.route("#Recursos/tabela");
                                    });//*/
                                }
                                else {
                                    $(row).find("li.RECURSO-RECURSO_PRECO").css("color","");
                                    //console.info(recurso.recurso_preco + " = " + json.recurso.RECURSO_PRECO);
                                }
                            });//*/
                        };

                        $(rows).children().each(function (i) {
                            //console.log(i, this);
                            var recurso = Fichas.fichas.recurso(this);
                            //-----------------
                            // RECURSO COMPOSTO
                            //-----------------
                            if (recurso.tipo_codigo == "COM") {
                                update_composto(this);
                                $(this).click(function (e) {
                                    var recurso = Fichas.fichas.recurso(this);
                                    update_composto(this);
                                    //alert(recurso.tipo_codigo);
                                    // obter rendimentos
                                    Fichas.fichas.rendimentosRecurso(recurso.recurso_id);
                                    // alternar para composto
                                    Fichas.fichas.toggleComposto(true);
                                });
                            }
                            //----------------
                            // RECURSO SIMPLES
                            //----------------
                            else {
                                $(this).click(function (e) {
                                    //alert(recurso.tipo_codigo);
                                    // obter os preços
                                    Fichas.fichas.precosRecurso($(this).find("li.RECURSO-RECURSO_ID").text());
                                    // alternar de composto
                                    Fichas.fichas.toggleComposto(false);
                                });
                            }
                        });
                    });

                    // create event: on recurso (in editor) change
                    toolbox.on("recursoChange", function(){
                        Fichas.fichas.toggleComposto($('#RECURSO-TIPO_CODIGO').val() == "COM");
                    });

                    // create event: new recurso
                    toolbox.on("novo", function () {
                        $("#adicionar-preco").hide();
                        $("#adicionar-rendimento").hide();
                        $("#PRECO-mosaicos").hide();
                        $("#RENDIMENTO-mosaicos").hide();
                        Fichas.fichas._limparPrecosRecurso();
                        Fichas.fichas._limparRendimentosRecurso();
                        //$(Fichas.fichas.rendimentosEl).html("<li>EMPTY</li>");
                        $('#RECURSO-TIPO_CODIGO').attr("disabled", false);
                        $('#RECURSO-TIPO_CODIGO option[value="COM"]').show();
                    });

                    // esconder privados; limpar editor; render tabela
                    toolbox.private(true).novo().tabela();

                });
            }
        },

        fornecedores: {
            toolbox: {
                name: "Fornecedores",
                items: [{
                    html: '<img src="icons/16/document.png"> Novo Fornecedor',
                    css: { cursor: "pointer" },
                    attr: { href: "#Fornecedores/novo" }
                },
                {
                    html: '<img src="icons/16/lightning.png"> Aplicar',
                    css: { cursor: "pointer" },
                    attr: {
                        href: "#Fornecedores/atualizar/FORNECEDOR_ID/FORNECEDOR_NOME,FORNECEDOR_MORADA"
                    }
                },
                {
                    html: '<img src="icons/16/close.png"> Eliminar',
                    css: { cursor: "pointer" },
                    attr: {
                        href: "#Fornecedores/delete/FORNECEDOR_ID/FORNECEDOR_NOME"
                    }
                },
                {
                    html: '<img src="icons/16/add.png"> Adicionar Contacto',
                    css: { cursor: "pointer" },
                    attr: {
                        id: "adicionar-contacto",
                        href: "#Recursos/adicionar-contacto"
                    }
                },
                {
                    html: '<img src="icons/16/search.png"> Procurar',
                    css: { cursor: "pointer" },
                    attr: { href: "#Fornecedores/search/FORNECEDOR_NOME" }
                },
                {
                    html: '<img src="icons/16/eye.png"> Atributos Privados',
                    css: { cursor: "pointer" },
                    attr: { href: "#Fornecedores/private" }
                }]
            },
            // callback de Fornecedores
            callback: function(bar, toolbox) {
                toolbox.entity("FORNECEDOR", function() {
                    toolbox.on("tabela", function (el) {
                        Fichas.fichas.contactosFornecedor($(el).find("li.FORNECEDOR-FORNECEDOR_ID").text());
                    }).on("novo", function(el) {
                        Fichas.fichas._limpaContactos();
                        $("#adicionar-contacto").hide();
                        $("#CONTACTO-mosaicos").hide();
                    });

                    toolbox.on("tableRows", function (rows) {
                        $(rows).children().click(function () {
                            $("#adicionar-contacto, #CONTACTO-mosaicos").show();
                        });
                    });

                    toolbox.private(["FORNECEDOR_ID"]).private(true).novo().tabela();
                });
            }
        },
        unidades: {
            toolbox: {
                name: "Unidades",
                items: [{
                    html: '<img src="icons/16/document.png"> Nova Unidade',
                    css: { cursor: "pointer" },
                    attr: { href: "#Unidades/novo" }
                },
                {
                    html: '<img src="icons/16/lightning.png"> Aplicar',
                    css: { cursor: "pointer" },
                    attr: {
                        href: "#Unidades/atualizar/UNIDADE_CODIGO/UNIDADE_NOME"
                    }
                },
                {
                    html: '<img src="icons/16/close.png"> Eliminar',
                    css: { cursor: "pointer" },
                    attr: {
                        href: "#Unidades/delete/UNIDADE_CODIGO/UNIDADE_NOME"
                    }
                },
                {
                    html: '<img src="icons/16/search.png"> Procurar',
                    css: { cursor: "pointer" },
                    attr: { href: "#Unidades/search" }
                }]
            },
            callback: function(bar, toolbox) {
                toolbox.entity("UNIDADE", function() {
                    toolbox.novo().tabela();
                });
            }
        },
        tipos: {
            toolbox: {
                name: "Tipos",
                items: [{
                    html: '<img src="icons/16/document.png"> Novo Tipo',
                    css: { cursor: "pointer" },
                    attr: { href: "#Tipos/novo" }
                },
                {
                    html: '<img src="icons/16/lightning.png"> Aplicar',
                    css: { cursor: "pointer" },
                    attr: {
                        href: "#Tipos/atualizar/TIPO_CODIGO/TIPO_NOME"
                    }
                },
                {
                    html: '<img src="icons/16/close.png"> Eliminar',
                    css: { cursor: "pointer" },
                    attr: {
                        href: "#Tipos/delete/TIPO_CODIGO/TIPO_NOME"
                    }
                },
                {
                    html: '<img src="icons/16/search.png"> Procurar',
                    css: { cursor: "pointer" },
                    attr: { href: "#Tipos/search" }
                }]
            },
            callback: function(bar, toolbox) {
                toolbox.entity("TIPO", function() {
                    toolbox.novo().tabela();
                });
            }
        }
    }
});
