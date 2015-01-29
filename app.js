//
// Recursos aka 'Fichas de Rendimento' database using jQuery Bar, FrontgateJS, and Situs PHP Framework
//
// Description: Prototype Interface for a (BD) School Project
// Author: José Vieira Lisboa
// E-mail: jose.vieira.lisboa@gmail.com
// Webpage: https://situs.pt/recursos
//

(function(app) { app.init("Fichas"); })({
    init: function(name) {
        Frontgate.Apps(name, this);
        // set routes
        for(var route in this.routes) {
            Frontgate.router.on(route, this.routes[route]);
        }
    },
    conf: function(url, callback) {
        $.getJSON(url, function(conf) {
            console.log("conf", conf);
            if(callback) callback(conf);
        });
    },
    start: function(user) {
        var app = this;
        app.conf("conf.json", function (conf) {
             app.api(user, conf);
             // create "Recursos" app
             window.Fichas = new Toolbar(app.data);
        });
    },
    routes: {
        "#user/:user/:pw": function(route) {
            var app = Frontgate.Apps("Fichas");

            if (typeof app.API != "undefined") {
                if (app.API.basicAuth(route.attr) == app.API.auth()) return;
                //localStorage.setItem("user", JSON.stringify(route.attr));
                location.reload();
                return;
            }

            //localStorage.setItem("user", JSON.stringify(route.attr));
            app.start(route.attr);
        },
        "#user/:user": function (route) {
            var hash = "#user/" + route.attr.user + "/" + route.attr.user;
            Frontgate.router.route(hash);
        },
        "#Contacto/ok": function(route) {
            location.hash = "#Fornecedores";

            // validar recurso
            var fornecedor_id = $("#FORNECEDOR_CONTACTO-FORNECEDOR_ID").val();
            if (!fornecedor_id) {
                console.log("Fornecedor Inválido");
                return;
            }

            // validar numero
            var contacto_numero = $("#FORNECEDOR_CONTACTO-CONTACTO_NUMERO").val();
            if (!contacto_numero) {
                console.log("Numero Inválido");
                return;
            }

            // validar numero
            var contacto_descritivo = $("#FORNECEDOR_CONTACTO-CONTACTO_DESCRITIVO").val();
            if (!contacto_descritivo) {
                console.log("Descritivo Inválido");
                return;
            }

            // INSERT RENDIMENTO
            var sql = "INSERT INTO FORNECEDOR_CONTACTO (FORNECEDOR_ID, CONTACTO_NUMERO, CONTACTO_DESCRITIVO) VALUES ";
            sql += "("+fornecedor_id+", '"+contacto_numero+"', '"+contacto_descritivo+"')";
            var url = "execute/" + sql;
            Fichas.fichas.recursos(url, function (json) {
                // atualizar mosaicos RENDIMENTO
                if (json === true) {
                    // recarregar os contactos
                    Fichas.fichas.contactosFornecedor(fornecedor_id);
                }
                else console.error(url, json);

                // voltar ao editor
                $("#overlay").fadeOut();
            });
        },
        "#Preco/ok": function(route) {
            location.hash = "#Recursos";

            // validar recurso
            var recurso_id = $("#PRECO-RECURSO_ID").attr("data-recurso_id");
            if(!recurso_id) {
                console.log("Recurso Inválido");
                return;
            }
            // validar fornecedor
            var fornecedor_id = $("#F1").attr("data-fornecedor_id");
            if(!fornecedor_id) {
                console.log("Fornecedor Inválido");
                return;
            }

            // validar valor
            var valor = $("#V1").val();
            if(!valor || !(valor.match(/^-?\d*(\.\d+)?$/))) {
                console.log("Valor Inválido");
                return;
            }

            // validar data
            var data = $("#D1").val();
            if(!data) {
                console.log("Data Inválida");
                return;
            }

            // INSERT PRECO
            var url = "preco/" + recurso_id + "/" + fornecedor_id + "/" + valor + "/" + data;
            Fichas.fichas.recursos(url, function(json) {
                //console.log(url, json);
                //precosRecurso: function(el, id)
                Fichas.fichas.precosRecurso(recurso_id);
                // voltar ao editor
                $("#overlay").fadeOut();
            });
        },
        "#Rendimento/ok" : function() {
            location.hash = "#Recursos";

            var dataset = $("#RENDIMENTO")[0].dataset;

            // validar recurso
            var composto_id = parseInt(dataset.rec_recurso_id);
            if (!composto_id) {
                console.log("Composto Inválido");
                return;
            }
            // validar fornecedor
            var recurso_id = parseInt(dataset.recurso_id);
            if (!recurso_id) {
                console.log("Recurso Inválido");
                return;
            }

            // validar quantidade
            var quantidade = dataset.quantidade;
            if (!quantidade || !(quantidade.match(/^-?\d*(\.\d+)?$/))) {
                console.log("Quantidade Inválida");
                return;
            }

            // validar valor
            var valor = dataset.preco_parcial;
            if (!valor || !(valor.match(/^-?\d*(\.\d+)?$/))) {
                console.log("Valor Inválido");
                return;
            }

            // INSERT RENDIMENTO
            var sql = "INSERT INTO RENDIMENTO (REC_RECURSO_ID, RECURSO_ID, QUANTIDADE, PRECO_PARCIAL) VALUES ";
            sql += "(" + composto_id + ", " + recurso_id + ", " + quantidade + ", " + valor + ")";
            var url = "execute/" + sql;
            Fichas.fichas.recursos(url, function (json) {
                // atualizar mosaicos RENDIMENTO
                if (json === true) {
                    // recarregar os rendimentos
                    Fichas.fichas.rendimentosRecurso(composto_id);

                    // recarregar a tabela
                    Frontgate.router.route("#Recursos/tabela");

                    /*/ ATUALIZA O PREÇO DO RECURSO COMPOSTO
                    var subQuery = "(SELECT SUM(PRECO_PARCIAL) FROM RENDIMENTO WHERE REC_RECURSO_ID = "+composto_id+" GROUP BY REC_RECURSO_ID)";
                    var sql = "UPDATE RECURSO SET RECURSO_PRECO = "+subQuery+" WHERE RECURSO_ID = "+composto_id;
                    var url = "execute/" + sql;
                    Fichas.fichas.recursos(url, function (json) {
                        if (json === true) Frontgate.router.route("#Recursos/tabela");
                        else console.error(url, json);
                    });//*/
                }
                else console.error(url, json);

                // voltar ao editor
                $("#overlay").fadeOut();
            });

        },
        "#Recursos/adicionar-contacto": function () {
            location.hash = "#Fornecedores";
            var dataset = $("#FORNECEDOR")[0].dataset;
            //console.log("#FORNECEDOR", dataset);

            var fornecedor_nome = $("#FORNECEDOR-FORNECEDOR_NOME").val();

            // o fornecedor ainda não existe ...
            if (!dataset.fornecedor_id) return console.log("O Fornecedor Ainda não Existe");

            $("#FORNECEDOR_CONTACTO").find("li.private").hide();

            // mosaicos de FORNECEDOR_CONTACTO do fornecedor
            //var $contactos = $("#CONTACTO-mosaicos li.CONTACTO");

            // prepara o editor do FORNECEDOR_CONTACTO
            $("#FORNECEDOR_CONTACTO").attr("data-fornecedor_id", dataset.fornecedor_id);
            $("#FORNECEDOR_CONTACTO").attr("data-contacto_numero", "");
            $("#FORNECEDOR_CONTACTO").attr("data-contacto_descritivo", "");
            //$("#FORNECEDOR_CONTACTO-CONTACTO_ID").val(id);
            $("#FORNECEDOR_CONTACTO-FORNECEDOR_ID").val(dataset.fornecedor_id);
            $("#FORNECEDOR_CONTACTO-FORNECEDOR").val(fornecedor_nome);
            $("#FORNECEDOR_CONTACTO-CONTACTO_NUMERO").val("");
            $("#FORNECEDOR_CONTACTO-CONTACTO_DESCRITIVO").val("");

            // esconder todos os divs no overalay
            $("#overlay div").hide();
            // mostrar o editor de rendimentos
            $("#add-contacto").show();
            // mostrar o overlay
            $("#overlay").fadeIn();
        },
        "#Recursos/adicionar-rendimento": function() {
            location.hash = "#Recursos";

            var id = $("#RECURSO-RECURSO_ID").val();// id do recurso no editor
            var nome = $("#RECURSO-NOME").val();// nome do recurso ...

            // id não existe (recurso novo no editor de RECURSO)
            if (!id) return console.log("O Recurso Ainda não Existe");

            $("#RENDIMENTO").find("li.private").hide();

            // mosaicos de PRECO do recurso
            var $rendimentos = $("#RENDIMENTO-mosaicos li.RENDIMENTO");
            
            // preencher o dataset do RENDIMENTO
            $("#RENDIMENTO").attr("data-rec_recurso_id", id);
            $("#RENDIMENTO").attr("data-recurso_id", "");
            $("#RENDIMENTO").attr("data-quantidade", "");
            $("#RENDIMENTO").attr("data-preco_parcial", "");
            //$("#RENDIMENTO").attr("data-data", Frontgate.Apps("Fichas").hoje());
            //$("#RENDIMENTO").attr("data-user", Frontgate.Apps("Fichas").user());

            // atualiza o valor do rendimento [preco parcial do recurso composto] em função do preço do recurso
            var update_preco_parcial = function () {
                var recurso = $("#RENDIMENTO-RECURSO")[0].dataset;
                var price = Math.round((recurso.recurso_preco * $("#RENDIMENTO-QUANTIDADE").val())*100)/100;
                $("#RENDIMENTO-PRECO_PARCIAL").val(price || 0);
                $("#RENDIMENTO").attr("data-preco_parcial", price || "null");
            };
            var quantidade_change = function () {
                var quantidade = Math.round($("#RENDIMENTO-QUANTIDADE").val()*100)/100;
                $("#RENDIMENTO").attr("data-quantidade", quantidade || 0);
            };

            // prepara o editor do RENDIMENTO
            $("#RENDIMENTO-REC_RECURSO_ID").val(id);
            $("#RENDIMENTO-RECURSO_ID").val("");
            $("#RENDIMENTO-QUANTIDADE").val("").change(quantidade_change).on("input", update_preco_parcial);
            $("#RENDIMENTO-PRECO_PARCIAL").val(0);
            $("#RENDIMENTO-COMPOSTO").val(nome);
            $("#RENDIMENTO-RECURSO").val("");

            // remover tabela existente
            $("#add-rendimento > ul.table.RECURSO").remove();

            // render tabela FORNECEDOR
            Fichas.fichas.tableFromQuery(null, "RECURSO", "#add-rendimento", function ($el) {
                // $el[0] is the table header and $el[1] is the table body
                var rows = $el[1];

                // for each row (em cada linha)
                $(rows).find("ul.row").each(function (index) {

                    // seja row esta linha (ou recurso)
                    var $row = $(this);
                    var row = Fichas.fichas.recurso(this);

                    // este recurso é o próprio recurso composto
                    if (row.recurso_id == id) {
                        $(this).remove();
                        return;
                    }

                    // em cada (mosaico de) RENDIMENTO
                    $rendimentos.each(function (xindex) {
                        // esta linha é de um recurso já usado num RENDIMENTO
                        if (row.recurso_id == parseInt(this.dataset.recurso_id)) {
                            // remover esta linha (ou recurso) da tabela
                            $row.parent().remove();
                            return false;
                        }
                    });
                });

                // cancelar porque não sobraram linhas (ou recursos)
                if (!$(rows).find('li').length) {
                    console.log("Não Existem Recursos Para O Rendimento");
                    return;
                }

                // click sobre os registos (linhas)
                $el.show().not(".header").find("ul.row").click(function (e) {
                    // toggle table row
                    $el.find("ul.row.selected").removeClass("selected");
                    $(this).addClass("selected");

                    // get recurso data and update recurso dataset
                    var recurso = Fichas.fichas.recurso(this);
                    $("#RENDIMENTO-RECURSO_ID").val(recurso.recurso_id);
                    $("#RENDIMENTO").attr("data-recurso_id", recurso.recurso_id);
                    $("#RENDIMENTO-RECURSO").val(recurso.nome + " [" + recurso.unidade_codigo + "]");
                    for (var name in recurso) $("#RENDIMENTO-RECURSO").attr("data-"+name, recurso[name]);

                    // update price
                    update_preco_parcial();
                });

                // esconder todos os divs no overalay
                $("#overlay div").hide();

                // mostrar o editor de rendimentos
                $("#add-rendimento").show();

                // mostrar o overlay
                $("#overlay").fadeIn();
            });
        },
        "#Recursos/adicionar-preco": function (route) {
            location.hash = "#Recursos";

            // id do recurso no editor
            var id = $("#RECURSO-RECURSO_ID").val();

            // nome do recurso ...
            var nome = $("#RECURSO-NOME").val();

            // id não existe (recurso novo no editor de RECURSO)
            if(!id) {
                console.log("O Recurso Ainda não Existe");
                return;
            }

            // mosaicos de PRECO do recurso
            var $precos = $("#PRECO-mosaicos li.PRECO");

            // prencher o editor de PREÇO com dados do RECURSO
            $("#PRECO-RECURSO_ID").attr("data-recurso_id", id).val(nome);

            $("#F1, #V1, #D1").val("");

            // limpar tabela existente
            $("#add-preco > ul.table.FORNECEDOR").remove();

            // render tabela FORNECEDOR
            Fichas.fichas.tableFromQuery(null, "FORNECEDOR", "#add-preco", function($el) {
                // table body
                var rows =  $el[1];

                // rows => ul.body > li ul.row > li
                // for each row (em cada linha)
                $(rows).find("ul.row").each(function(index) {
                    // seja row esta linha
                    var row = this;
                    // em cada mosaico de Preço
                    $precos.each(function(xindex){
                        // se o id da linha for igual ao id do atual mosaico
                        if(Fichas.fichas.fornecedor(row).id == this.dataset.fornecedor_id) {
                            // remover o fornecedor (a linha)
                            $(row).parent().remove();
                        }
                    });
                });

                // não sobraram linhas (fornecedores)
                if(!$(rows).find('li').length) {
                    console.log("Não Existem Fornecedores Para O Fornecimento");
                    return;
                }

                // definir o click sobre os registos (linhas)
                $el.show().not(".header").find("ul.row").click(function(e) {
                    $el.find("ul.row").removeClass("selected");// unselect selected row
                    $(this).addClass("selected");// select clicked row

                    var fornecedor = Fichas.fichas.fornecedor(this);
                    console.log("PRECO > FORNECEDOR", fornecedor);
                    $("#F1").attr("data-fornecedor_id", fornecedor.id).val(fornecedor.nome);
                });

                // esconder todos os divs no overalay
                $("#overlay div").hide();

                // mostrar o editor de preços
                $("#add-preco").show();

                // mostrar o overlay
                $("#overlay").fadeIn();
            });
        }
    },
    FICHAS: {},
    templates: {},
    //?
    togglePanel: function(panel, flag) {
        if(flag) $(panel).fadeIn();
        else $(panel).fadeOut();
    },
    // mostra|esconde preços|rendimentos
    toggleComposto: function(isCOM) {
        // composto
        if (isCOM) {
            $("#adicionar-preco").hide();
            $("#adicionar-rendimento").show();
            $("#PRECO-mosaicos").hide();
            $("#RENDIMENTO-mosaicos").show();
            $('#RECURSO-TIPO_CODIGO').attr("disabled", true);
        }
        else {
            $("#adicionar-preco").show();
            $("#adicionar-rendimento").hide();
            $("#RENDIMENTO-mosaicos").hide();
            $("#PRECO-mosaicos").show();
            $('#RECURSO-TIPO_CODIGO option[value="COM"]').hide();
            $('#RECURSO-TIPO_CODIGO').attr("disabled", false);
        }
    },
    //
    _fields: {
        RECURSO: {
            RECURSO_ID: "ID",
            NOME: "NOME",
            TIPO_CODIGO: "TIPO",
            UNIDADE_CODIGO: "UNIDADE",
            RECURSO_PRECO: "PREÇO",
            FORNECEDOR_ID: "FID",
            USER: "USER",
            DATA_ATUALIZADO: "ATUALIZADO"
        }
    },
    tableFieldWidth: function(table, field) {
        var value = field;
        if(this._fields[table] && this._fields[table][field]) {
            value = this._fields[table][field];
        }
        return {
            name: field,
            value: value,
            "class": table + "-" + field,
            length: value.length
        };
    },

    // Rende tabela a partir de uma consulta
    tableFromQuery: function(query, table, target, callback) {
        query = query || table;
        var Fichas = this;
        this.recursos(query, function(json) {
            var lengths = [], rows = [];
           // rows
            for(var i in json) {
                var row = json[i], items = [], k = 0;
                // row attributes
                for (var name in row) {
                    var value = row[name];
                    var cssClass = table + "-" + name;
                    if(value === null) {
                        value = "null";
                        cssClass = cssClass + " null";
                    }
                    items[k] = {
                        name: name,
                        value: value,
                        "class": cssClass//TODO rever nome da class
                    };
                    if(!lengths[k]) {
                        lengths[k] = Fichas.tableFieldWidth(table, name);
                    }
                    if(value == null) {
                        value = "null";
                    }
                    if(value.length > lengths[k].length) {
                        lengths[k].length = value.length;
                    }
                    k++;
                }
                // adicionar linha
                rows[i] = { data: _.template($("#template-row").html(), { items: items }) };
            }

            // table body
            $(_.template($("#template-rows").html(), { items:rows, "classe": table }))
                .addClass("table body").appendTo($(target));

            // table header
            var header = _.template($("#template-row").html(), { items: lengths});
            $(_.template($("#template-rows").html(), { items: [{ data: header }], "classe": table }))
                .addClass("table header").insertBefore($(target+" ul.table.body."+table));


            for (var x in lengths) {
                var column = lengths[x], selector = "li." +table + "-" + column.name;
                $(selector).css("width", (column.length * 7 + 4)+ "px");
            }
            
            var selector = target+ " ul.table."+table;

            // style="border: none;"
            $tools = $('<li class="tools">');
            $(target + " ul.table.header." + table).find("ul.row").append($tools);

            $('<img width="20" class="search" title="procurar" src="icons/1.png">').appendTo($tools);
            $('<img width="20" class="loading" title="carregar" src="icons/3.png">').appendTo($tools);

            if(callback) callback($(selector));
        });
    },
    // cria a toolbox com as tabelas na base de dados
    tabelas: function($fichas) {
        var tabelas = this.FICHAS.Tables_in_FICHAS;

        var toggle = function(table) {
            $("ul.table.selected").removeClass("selected");
            $("ul.table."+table).addClass("selected");
        };

        //TODO addicionar esta funcionalidade a Bar
        var toggleItem = function(el) {
            $(el).parent().siblings().removeClass("selected");
            $(el).parent().addClass("selected");
        };

        // preparar os items (botões) da toolbox
        var items = [];
        // nomes das tabelas
        for(var i in tabelas) {
            // items da toolbox
            items[items.length] = {
                text: tabelas[i],// nome da tabela
                attr: {
                    "class" : "tables-button",
                    id: tabelas[i]+"-"+i
                },
                css: { cursor: "pointer" },
                click: function(e) {
                    // selectiona a respectiva tabela
                    toggle(this.text);
                    // selecciona o respectivo botão
                    toggleItem("#"+this.id);
                    return false;
                }
            };
        }

        // construir a toolbox (Bar)
        var fichas = this;
        var selector = "#Tabelas";
        $fichas.bar({
            toolbox: {
                name: "Tabelas",// nome da toolbox
                items: items // botões
            },
            callback: function(bar, data) {
                // criar a divisória para as tabelas
                $("<div>").attr("id", "Tabelas").addClass("toolbox container").appendTo("#body");
                // criar a tabela
                for(var j in items) {
                    fichas.tableFromQuery(null, items[j].text, selector);
                }
                // subscrever o evento da alteração da 'location hash' para mostrar a toolbox
                Frontgate.router.on(selector, function(route) {
                    $("div.toolbox.container").hide();
                    Fichas.toggle(selector, true);
                });
            }
        });

        Frontgate.router.route("#Tabelas");
    },
    // devolve a data de hoje no formato aaaa-mm-dd
    hoje: function() {
        var data = new Date(Date.now());
        var date = data.getFullYear() + '-' + (data.getMonth() + 1)+ '-' + data.getDate();
        //console.log("date", date);
        return date;
    },
    // faz chamada Ajax ao controlador da base de dados
    recursos: function(url, done) {
        url = this.API.href(url);
        $.ajaxSetup({ beforeSend: this.API.xhrAuth() });// controller auth
        $.ajax({ type: "GET", dataType: "json", url: url }).done(done);
    },
    // API para o controlador da base de dados FICHAS
    api: function(auth, conf) {
        conf = conf || { hostname: "situs.lan", protocol: "https:", pathname: "/recursos" };
        this.API = Frontgate.location(conf);
        this.API.auth(auth);
    },
    //
    user: function() {
        return this.FICHAS["USER"];
    },

    // obtém fornecedor a partir de uma linha da tabela
    fornecedor: function(ul) {
        return {
            id: $(ul).find("li.FORNECEDOR-FORNECEDOR_ID").text(),
            nome: $(ul).find("li.FORNECEDOR-FORNECEDOR_NOME").text(),
            morada: $(ul).find("li.FORNECEDOR-FORNECEDOR_MORADA").text()
        };
    },
    // obtém dados de um recurso a partir de uma linha da tabela
    recurso: function (ul) {
        return {
            recurso_id: parseInt($(ul).find("li.RECURSO-RECURSO_ID").text()),
            fornecedor_id: parseInt($(ul).find("li.RECURSO-FORNECEDOR_ID").text()) || "null",
            tipo_codigo: $(ul).find("li.RECURSO-TIPO_CODIGO").text(),
            nome: $(ul).find("li.RECURSO-NOME").text(),
            unidade_codigo: $(ul).find("li.RECURSO-UNIDADE_CODIGO").text(),
            recurso_preco: parseFloat($(ul).find("li.RECURSO-RECURSO_PRECO").text()) || "null",
            data_atualizado: $(ul).find("li.RECURSO-DATA_ATUALIZADO").text(),
            user: $(ul).find("li.RECURSO-USER").text(),
        };
    },
    
    //=======
    // PRECO
    //=======
    // selector ...
    _precosEl: "#PRECO-mosaicos ul",
    // limpa os mosaicos de preços
    _limparPrecosRecurso: function () {
        $(this._precosEl).html("<li>SEM PREÇOS</li>");
    },
    // rende os mosaicos PREÇO
    _precosRecurso: function (items) {
        // elemento preço a partir de template
        var html = _.template($("#template-RECURSO-PRECO").html(), { precos: items });

        // preço do recurso é o fornecido
        $(this._precosEl).html(html).children().each(function(index) {
            // preço do FORNECIMENTO do RECURSO
            var fornecedor_id = $("#RECURSO-FORNECEDOR_ID").val();
            if(parseInt(fornecedor_id) == parseInt(this.dataset.fornecedor_id)) {
                $(this).find("input").click();
            }
        });

        // botão 'eliminar preço'
        $(this._precosEl).find("img.eliminar").click(function (e) {
            var input = $(this).parent().find("input")[0];
            var span = $(this).parent().find("span").text();
            var el = $(this).parent().parent()[0];
            var dataset = el.dataset;
            // pedido de confirmação ...
            var msg = "Eliminar o PREÇO '" + span + "' (" + dataset.valor + " €)?"
            if (!confirm(msg)) {
                console.log("eliminação de PREÇO cancelada");
                return;
            }

            var FICHAS = Frontgate.Apps("Fichas");
            // se for o preço em vigor remove o seu fornecedor do recurso 
            if (input.checked) {
                FICHAS.update_recurso_fid(null, 0, $("#RECURSO")[0].dataset);
            }
            // eliminar o preço
            //fichas.delete_PRECO(dataset.fornecedor_id, dataset.recurso_id);

            var url = "preco/delete/" + dataset.fornecedor_id + "/" + dataset.recurso_id;
            FICHAS.recursos(url, function (json) {
                console.log(url, json);
                // atualizar lista de preços
                FICHAS.precosRecurso(dataset.recurso_id);
            });
        });
    },
    // obtém preços dum recurso
    precosRecurso: function(id) {
        this._limparPrecosRecurso();
        if (!id) return;
        var FICHAS = this;
        var url = "precos/" + id;
        this.recursos(url, function(json) {
            if (!json.length) return;
            // console.log("A Render Preços");
            $(FICHAS._precosEl).html("");// limpar preços existente
            FICHAS._precosRecurso(json);// render preços
        });
    },

    //==========
    // RENDMENTO
    //==========
    // selector do elemento dos mosaicos
    _rendimentosEl: "#RENDIMENTO-mosaicos > ul",
    // rende os mosaicos dos rendimentos
    _rendimentosRecurso: function (ficha) {
        var html = _.template($("#template-RECURSO-RENDIMENTO").html(), ficha);

        $(this._rendimentosEl).html(html).find("img.eliminar").click(function (e) {
            var span = $(this).parent().find("span").text();
            var dataset = $(this).parent().parent()[0].dataset;
            var composto_id = $("#RECURSO-RECURSO_ID").val();            
            var rendimento = $(this).parent().parent().find("label").text();
            var composto = $("#RECURSO-NOME").val();

            // confirmar eliminação ...
            var msg = "Deseja eliminar o RENDIMENTO de " + span + " [" + rendimento + "] do RECURSO composto '" + composto + "'?"
            if (!confirm(msg)) return console.log("eliminação de RENDIMENTO cancelada");
           
            // eliminar o rendimento
            //var url = "rendimento/delete/" + composto_id + "/" + dataset.recurso_id;
            var sql = "DELETE FROM RENDIMENTO WHERE REC_RECURSO_ID = "+composto_id+" AND RECURSO_ID = "+dataset.recurso_id;
            var url = "execute/" + sql;
            Frontgate.Apps("Fichas").recursos(url, function (json) {
                // atualizar lista de rendimentos
                if (json === true) {
                    Frontgate.Apps("Fichas").rendimentosRecurso(composto_id);
                    Frontgate.router.route("#Recursos/tabela");
                    return;
                }
                console.error("Erro a eliminar o RENDIMENTO [" + rendimento + " ] em " + span + " do RECURSO '" + composto + "'");
                console.log(url, json);
            });
        });
    },
    // limpa mosaicos dos rendimentos
    _limparRendimentosRecurso: function() {
        $(this._rendimentosEl).html("<li>Sem Rendimento</li>");
    },
    // obtém rendimentos
    rendimentosRecurso: function (id) {
        this._limparRendimentosRecurso();
        if (!id) return;

        var FICHAS = this;
        
        if (1) {
            var url = "rendimento/" + id;
            FICHAS.recursos(url, function (json) {
                //console.log(url, json);

                var total = json.recurso.RECURSO_PRECO, rendimentos = [];

                // recurso composto
                if (json.recursos) rendimentos = json.recursos;

                FICHAS._rendimentosRecurso({ recurso: id, rendimentos: rendimentos, total: total });
            });
            return;
        }

        var query = "SELECT {fields} FROM {tables} WHERE RECURSO.RECURSO_ID = RENDIMENTO.RECURSO_ID AND RENDIMENTO.REC_RECURSO_ID = {id}";
        var fields = "RECURSO.NOME AS NOME, RENDIMENTO.RECURSO_ID AS RECURSO_ID, QUANTIDADE, RECURSO.UNIDADE_CODIGO AS UNIDADE, RENDIMENTO.QUANTIDADE*RECURSO.RECURSO_PRECO AS PRECO_PARCIAL";
        var tables = "RECURSO, RENDIMENTO";
        query = query.replace("{fields}", fields).replace("{tables}", tables).replace("{id}", id);
        var url = "query/" + query;
        FICHAS.recursos(url, function (json) {
            if (!json.length) return;
            // console.log("A Render Rendimentos");
            var total = 0;
            for (var i in json) {
                json[i].QUANTIDADE = parseFloat(json[i].QUANTIDADE);
                json[i].PRECO_PARCIAL = parseFloat(json[i].PRECO_PARCIAL);
                total += json[i].PRECO_PARCIAL;
            }
            
            console.log({ recurso: id, rendimentos: json, total: Math.round(total * 100) / 100 });
            FICHAS._rendimentosRecurso({ recurso: id, rendimentos: json, total: Math.round(total*100)/100 }); 
        });
    },

    //=========
    // CONTACTO
    //=========
    _contactosEl: "#CONTACTO-mosaicos > ul",
    _limpaContactos: function () {
        $(this._contactosEl).html("<li>Sem Contacto</li>");
    },
    // rende contactos
    _mostraContactos: function(items) {

        $(this._contactosEl).html("");
        var html = _.template($("#template-FORNECEDOR-CONTACTO").html(), { contactos: items });

        $(this._contactosEl).html(html).find("img.eliminar").click(function (e) {
            var dataset = $(this).parent().parent()[0].dataset;
            // confirmar eliminação ...
            var msg = "Deseja eliminar o CONTACTO '"+dataset.contacto_numero+"' ("+dataset.contacto_descritivo+")?"
            if (!confirm(msg)) return console.log("eliminação de CONTACTO cancelada");

            var sql = "DELETE FROM FORNECEDOR_CONTACTO WHERE CONTACTO_ID = " + dataset.contacto_id;
            Frontgate.Apps("Fichas").recursos("execute/"+sql, function (json) {
                // atualizar lista de rendimentos
                if (json !== true) console.error(sql, json);
                Frontgate.Apps("Fichas").contactosFornecedor(dataset.fornecedor_id);
            });
        });
    },
    contactosFornecedor: function(id) {
        var el = this._contactosEl;
        var fichas = this;
        if(!id) return this._limpaContactos();
        var url = "contactos/" + id;
        fichas.recursos(url, function(json) {
            console.log(url, json);
            // não tem preços
            if(json === null || !json.length) return fichas._limpaContactos();
            else return fichas._mostraContactos(json);
        });
    },

    // radios in #RECURSO_PRECO
    clickedRadio: function(el) {
        var $li = $(el).parent().parent();
        var preco = $li[0].dataset;
        var recurso = $("#RECURSO")[0].dataset;

        //console.log("PRECO", preco);
        //console.log("RECURSO", recurso);

        var fornecedor_id = $("#RECURSO-FORNECEDOR_ID").val();
        var valor = $('#RECURSO-RECURSO_PRECO').val();

        //TODO comparar com o dataset de recurso
        if(preco.fornecedor_id == recurso.fornecedor_id && preco.valor == recurso.recurso_preco) {
            console.info("Recurso sem alteração de Preço");
            return;
        }

        this.update_recurso_fid(preco.fornecedor_id, preco.valor, recurso);
    },
    // atualiza (fornecedor de) recurso 
    update_recurso_fid: function(fornecedor_id, valor, recurso) {
        //TODO atualizar o dataset de recurso ... ?
        $("#RECURSO-FORNECEDOR_ID").val(fornecedor_id);
        $('#RECURSO-RECURSO_PRECO').val(valor);
        recurso.fornecedor_id = fornecedor_id;
        recurso.recurso_preco = valor;

        var fichas = Frontgate.Apps("Fichas");
        var url = "recurso/preco/" + recurso.recurso_id + "/" + fornecedor_id + "/" + valor
        fichas.recursos(url, function(json) {
            if (typeof json == "string" && json.match(/^SQLSTATE/)) {
                console.error(json);
                console.log("FICHAS.update_recurso_fid url:", url);
                return;
            }
            if (json == false) console.error("Falha A ATUALIZAR preço");
            else Fichas.toolbox("recursos").tabela();
        });
    }
});
