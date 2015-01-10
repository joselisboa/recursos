//
// Recursos aka 'Fichas de Rendimento' database using jQuery Bar, FrontgateJS, and Situs PHP Framework
//
// Description: Prototype Interface for a (BD) School Project
// Author: José Vieira Lisboa
// E-mail: jose.vieira.lisboa@gmail.com
// Webpage: https://situs.pt/recursos
//

(function(app) {
    app.init("Fichas");
})({
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
    routes: {
        "#user/:user/:pw": function(route) {
            var app = Frontgate.Apps("Fichas");
            if(typeof app.API != "undefined") return;
            app.conf("conf.json", function (conf) {
                app.api(route.attr, conf);
                window.Fichas = new Toolbar(app.data);
            });
        },
        "#Recursos/ok": function(route) {
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
            var url = "preco/"+recurso_id+"/"+fornecedor_id+"/"+valor+"/"+data;
            Fichas.fichas.recursos(url, function(json) {
                //console.log(url, json);
                //precosRecurso: function(el, id)
                Fichas.fichas.precosRecurso("#PRECO-mosaicos ul", recurso_id);
                // voltar ao editor
                $("#overlay").fadeOut();
            });
        },

        "#Recursos/adicionar-preco": function(route) {
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

    togglePanel: function(panel, flag) {
        if(flag) $(panel).fadeIn();
        else $(panel).fadeOut();
    },

    toggleComposto: function(composto) {
        // composto
        if(composto) {
            $("#PRECO-mosaicos").hide();
            //$("#RENDIMENTO-mosaicos").show();
            $('#RECURSO-TIPO_CODIGO').attr("disabled", true);
        }
        else {
            //$("#RENDIMENTO-mosaicos").hide();
            $("#PRECO-mosaicos").show();
            $('#RECURSO-TIPO_CODIGO option[value="COM"]').hide();
            $('#RECURSO-TIPO_CODIGO').attr("disabled", false);
        }
    },
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
                rows[i] = { data: _.template($("#row-template").html(), { items: items }) };
            }

            // table body
            $(_.template($("#rows-template").html(), { items:rows, "classe": table }))
                .addClass("table body").appendTo($(target));

            // table header
            var header = _.template($("#row-template").html(), { items: lengths});
            $(_.template($("#rows-template").html(), { items: [{ data: header }], "classe": table }))
                .addClass("table header").insertBefore($(target+" ul.table.body."+table));

            for(var x in lengths) {
                var column = lengths[x], selector = "li." +table + "-" + column.name;
                $(selector).css("width", (column.length * 7 + 4)+ "px");
            }

            var selector = target+ " ul.table."+table;

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

    // ?
    recursivo: function( json ) {
        for(var i = 0; i < json.length; i++) {
            var html = [];
            var $li = $('<li>');
            var k = 0;
            for(var j in json[i]){
                $li.attr('data-'+j, json[i][j]);
                html[k++] = '<span class="'+j+'">'+json[i][j]+'</span>';
            }
            $li.click(function(){
                Recursos.setValores(Recursos.valoresLi($(this)));
                $("li.selected").removeClass("selected");
                $(this).addClass("selected");
            }).html(html.join(" | ")).appendTo("#RECURSOS");
        }
    },

    // API para o controlador da base de dados FICHAS
    api: function(auth, conf) {
        conf = conf || { hostname: "situs.lan", protocol: "https:", pathname: "/recursos" };
        this.API = Frontgate.location(conf);
        this.API.auth(auth);
    },

    user: function() {
        return this.FICHAS["USER"];
    },

    //TODO dataset
    // obtém fornecedor (numa linha da tabela)
    fornecedor: function(ul) {
        return {
            id: $(ul).find("li.FORNECEDOR-FORNECEDOR_ID").text(),
            nome: $(ul).find("li.FORNECEDOR-FORNECEDOR_NOME").text(),
            morada: $(ul).find("li.FORNECEDOR-FORNECEDOR_MORADA").text()
        };
    },

    //=======
    // PRECO
    //=======

    // eleimina um preço
    delete_PRECO: function(fid, rid, callback) {
        var url = "preco/delete/" + fid + "/" + rid;
        this.recursos(url, function(json) {
            console.log(url, json);
            if(callback) callback(json);
            // atualizar lista de preços
            Frontgate.Apps("Fichas").precosRecurso("#PRECO-mosaicos ul", rid);
        });
    },

    // limpa os mosaicos de preços
    _limparPrecosRecurso: function(el) {
        $(el).html("").append($('<button>').text("Adicionar Preço").click(function() {
            location.hash = "#Recursos/adicionar-preco";
        }));
    },

    // rende os mosaicos preços
    _precosRecurso: function(el, items) {
        // elemento preço a partir de template
        var html = _.template($("#RECURSO-PRECO-template").html(), { precos: items });

        // preço do recurso fornecido
        $(el).append(html).children().each(function(index) {
            // preço do FORNECIMENTO do RECURSO
            var fornecedor_id = $("#RECURSO-FORNECEDOR_ID").val();
            if(parseInt(fornecedor_id) == parseInt(this.dataset.fornecedor_id)) {
                $(this).find("input").click();
            }
        });

        // botão 'eliminar preço'
        $(el).find("img.eliminar").click(function(e) {
            var input = $(this).parent().find("input")[0];
            var span = $(this).parent().find("span").text();
            var el = $(this).parent().parent()[0];
            var dataset = el.dataset;
            var msg = "Eliminar o PREÇO '"+ span + "' ("+dataset.valor+" €)?"
            if (!confirm(msg)) {
                console.log("eliminação de PREÇO cancelada");
                return;
            }

            var fichas = Frontgate.Apps("Fichas");
            if(input.checked) {
                fichas.update_recurso_fid(null, 0, $("#RECURSO")[0].dataset);
            }

            fichas.delete_PRECO(dataset.fornecedor_id, dataset.recurso_id);
        });
    },

    // obtém preços dum recurso
    precosRecurso: function(el, id) {
        var Fichas = this;

        if(!id) {
            Fichas._limparPrecosRecurso(el);
            return;
        }

        var url = "precos/" + id;
        Fichas.recursos(url, function(json) {
            console.log(url, json);

            // não tem preços
            if(!json.length) {
                Fichas._limparPrecosRecurso(el);
            }
            else {// console.log("A Render Preços");
                $(el).html("");// limpar preços existente
                Fichas._precosRecurso(el, json);// render preços
            }
        });
    },

    _limpaContactos: function(el) {
        $(el).html("").append($('<button>').text("Adicionar Contacto").click(function() {
            location.hash = "#Fornecedores/adiciona-contacto";
        }));
    },

    _mostraContactos: function(el, items) {
        $(el).html("");
        var html = _.template($("#FORNECEDOR-CONTACTO-template").html(), { contactos: items });
        $(el).append(html);
    },

    contactosFornecedor: function(el, id) {
        var fichas = this;
        if(!id) return this._limpaContactos(el);
        var url = "contactos/" + id;
        fichas.recursos(url, function(json) {
            console.log(url, json);
            // não tem preços
            if(json === null || !json.length) return fichas._limpaContactos(el);
            else return fichas._mostraContactos(el, json);
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

    // atualiza recurso após eliminação de preço
    update_recurso_fid: function(fornecedor_id, valor, recurso) {
        //TODO atualizar o dataset de recurso?
        $("#RECURSO-FORNECEDOR_ID").val(fornecedor_id);
        $('#RECURSO-RECURSO_PRECO').val(valor);
        recurso.fornecedor_id = fornecedor_id;
        recurso.recurso_preco = valor;
        var url = "recurso/preco/"+recurso.recurso_id+"/"+fornecedor_id+"/"+valor
        console.log(">>> update_recurso_fid > url:", url);
        var fichas = Frontgate.Apps("Fichas");
        fichas.recursos(url, function(json) {
            console.log(url, json);
            if(json == false) console.log("Falha A ATUALIZAR preço");
            else Fichas.toolbox("recursos").tabela();
        });
    }
});
