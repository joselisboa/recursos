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

        // load current location route
        Frontgate.router.route(location.hash);
    });

})({
    toolbar: {
        name: "Fichas",
        items: [{
                text: "Fichas de Rendimento"
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
                    css: { cursor: "pointer" },
                    attr: { href: "#Recursos/search/NOME" }
                },
                {
                    html: '<img src="icons/16/add.png"> Adicionar Preço',
                    attr: { id: "adicionar-preco" },
                    css: { cursor: "pointer" },
                    attr: { href: "#Recursos/adicionar-preco" }
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
            callback: function(bar, toolbox) {
                toolbox.entity("RECURSO", function() {
                    toolbox.private(["RECURSO_PRECO", "FORNECEDOR_ID", "USER", "DATA_ATUALIZADO", "RECURSO_ID"])
                    .placeholder({ RECURSO_ID: "#", NOME: "Nome", RECURSO_PRECO: "€" });

                    $("#RECURSO-DATA_ATUALIZADO").attr({
                        "min": "2015-01-01",
                        "max": "2015-12-31",
                        "type": "date"
                    });

                    // lista de tipos
                    $("#RECURSO-TIPO_CODIGO").html(_.template($("#tipo_option").html(), {
                        items: Fichas.fichas.FICHAS.Tables.TIPO
                    }));

                    // lista de unidades
                    $("#RECURSO-UNIDADE_CODIGO").html(_.template($("#unidade_option").html(), {
                        items: Fichas.fichas.FICHAS.Tables.UNIDADE
                    }));

                    // não mostrar recursos compostos
                    toolbox.on("tableRows", function(rows) {
                        $(rows).find("ul.row").click(function(e) {
                            if($(this).find("li.RECURSO-TIPO_CODIGO").text() == "COM") {
                                Fichas.fichas.toggleComposto(true);
                            }
                            else {
                                Fichas.fichas.precosRecurso("#PRECO-mosaicos ul", $(this).find("li.RECURSO-RECURSO_ID").text());
                                Fichas.fichas.toggleComposto(false);
                            }
                        });

                    });

                    toolbox.on("recursoChange", function(){
                        Fichas.fichas.toggleComposto($('#RECURSO-TIPO_CODIGO').val() == "COM");
                    });

                    toolbox.on("novo", function(){
                        $("#PRECO-mosaicos").hide();
                        $("#RENDIMENTO-mosaicos").hide();
                        Fichas.fichas._limparPrecosRecurso("#PRECO-mosaicos ul");
                        $('#RECURSO-TIPO_CODIGO').attr("disabled", false);
                        $('#RECURSO-TIPO_CODIGO option[value="COM"]').show();
                    });

                    // esconder privados; limpar editor; render tabela
                    toolbox.private(true).novo().tabela();

                    // precos
                    Fichas.fichas.precosRecurso("#PRECO-mosaicos ul");
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
                    html: '<img src="icons/16/add.png"> Adicionar Preço',
                    attr: { id: "adicionar-preco" }
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
                    toolbox.on("tabela", function(el){
                        Fichas.fichas.contactosFornecedor("#CONTACTO-mosaicos ul", $(el).find("li.FORNECEDOR-FORNECEDOR_ID").text());
                    }).on("novo", function(el) {
                        Fichas.fichas._limpaContactos("#CONTACTO-mosaicos ul");
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
