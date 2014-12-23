//
// Recursos aka 'Fichas de Rendimento' database using jQuery Bar, FrontgateJS, and Situs PHP Framework
//
// Description: Prototype Interface for a (BD) School Project
// Author: José Vieira Lisboa
// E-mail: jose.vieira.lisboa@gmail.com
// Webpage: https://situs.pt/recursos
//

// requires Frontgate

(function(toolbar){
    Frontgate.Apps("Fichas", toolbar);
    window.Toolbox = toolbar.Toolbox;
    window.Toolbar = toolbar.Toolbar;

    // set routes
    for(var route in toolbar.routes) {
        Frontgate.router.on(route, toolbar.routes[route]);
    }

    // load route from location hash
    Frontgate.router.route(location.hash);
})({
   conf: function(url, callback) {
        $.getJSON(url, function(conf) {
            console.log("conf", conf);
            if(callback) callback(conf);
        });
   },
    routes: {
        "#user/:user/:pw": function(route) {
            var fichas = Frontgate.Apps("Fichas");
            if(typeof fichas.API != "undefined") return;
            fichas.conf("conf.json", function(conf) {
                fichas.api(route.attr);
                Frontgate.script("fichas.js");
            });
        }
    },
    FICHAS: {},
    templates: {},
    // 
    togglePanel: function(panel, flag) {
        if(flag) $(panel).fadeIn();
        else $(panel).fadeOut();
    },

    //TODO addicionar esta funcionalidade a Bar
    toggleToolboxItem: function(el) {
        $(el).parent().siblings().removeClass("selected");
        $(el).parent().addClass("selected");
    },
    
    // esconder campos privados
    togglePrivateAttr: function(selector, hide) {
        if(!selector) return;
        hide = hide || $(selector+" li.private").is(":visible");
        if(hide) $(selector+" li.private").hide();
        else $(selector+" li.private").show();
    },

    toggleTable: function(table) {
        $("ul.table.selected").removeClass("selected");
        $("ul.table."+table).addClass("selected");
    },

    // rende uma tabela
    tabela: function(table, target, callback) {
        this.tableFromQuery(null, table, target, callback);
    },

    _fields: {
        RECURSO: {
            RECURSO_ID: "ID",
            NOME: "NOME",
            TIPO_CODIGO: "TIPO",
            UNIDADE_CODIGO: "UNIDADE",
            RECURSO_PRECO: "PREÇO",
            USER: "USER",
            DATA_ATUALIZADO: "ATUALIZADO"
        }
    },
    tableFieldWidth: function(table, field) {
        var value = field;
        if(this._fields[table] && this._fields[table][field]) value = this._fields[table][field];
        return { name: field, value: value, "class": table+"-"+field, length: value.length };
    },

    // Rende tabela a partir de uma consulta
    tableFromQuery: function(query, table, target, callback) {
        var Fichas = this;
        // database query
        this.recursos(query || table, function(json) {
            var lengths = [], rows = [];

            // rows
            for(var i in json) {
                var row = json[i], items = [], k = 0;

                // row attributes
                for (var name in row) {
                    var value = row[name];
                    items[k] = { name: name, value: value, "class": table+"-"+name };//TODO rever nome da class
                    if(!lengths[k]) lengths[k] = Fichas.tableFieldWidth(table, name);
                    if(value.length > lengths[k].length) lengths[k].length = value.length;
                    k++;
                }

                //  adicionar linha
                rows[i] = { data: _.template($("#row-template").html(), { items: items }) };
            }

            // table body
            $(_.template($("#rows-template").html(), { items:rows, "classe": table }))
                .addClass("table body").appendTo($(target));

            // table header
            var header = _.template($("#row-template").html(), { items: lengths});
            $(_.template($("#rows-template").html(), { items: [{ data: header }], "classe": table }))
                .addClass("table header").insertBefore($(target+" ul.table.body."+table));
            //console.log(table, lengths);

            for(var x in lengths) {
                var column = lengths[x], selector = "li." +table + "-" + column.name;
                $(selector).css("width", (column.length * 7 + 4)+ "px");
            }

            var selector = target+ " ul.table."+table;

            if(callback) callback($(selector));//callback("#"+table+"-"+afix);//
        });
    },

    // cria a toolbox com as tabelas na base de dados
    tabelas: function(Tables) {
        // preparar os items (botões) da toolbox
        var items = [];
        // nomes das tabelas
        for(var i in Tables) {
            // items da toolbox
            items[items.length] = {
                text: Tables[i],// nome da tabela
                attr: { "class" : "tables-button", id: Tables[i]+"-"+i },
                css: { cursor: "pointer" },
                click: function(e) {
                    // selectiona a respectiva tabela
                    Frontgate.Apps("Fichas").toggleTable(this.text);
                    // selecciona o respectivo botão
                    Frontgate.Apps("Fichas").toggleToolboxItem("#"+this.id);
                    return false;
                }
            };
        }

        // construir a toolbox (Bar)
        var Fichas = this;
        $("#fichas").bar({
            toolbox: { 
                name: "FICHAS",// nome da toolbox
                items: items // botões
            },
            callback: function(bar, data) {
                // criar a divisória para as tabelas
                $("<div>").attr("id", "Fichas").addClass("container").appendTo("#body");
                // criar a tabela
                for(var j in items) Fichas.tableFromQuery(null, items[j].text, "#Fichas");
                // subscrever o evento da alteração da 'location hash' para mostrar a toolbox
                bar.navigator.subscribeEvent('hash', function(route) {
                    Fichas.togglePanel("#Fichas", route.res.input == '#Fichas');
                });
            }
        });

        // selecionar a toolbox #Recursos
        this.tab("#Fichas");
    },

    // selecciona separador
    tab: function(tab) { Frontgate.router.route(tab); },

    // devolve a data de hoje no formato aaaa-mm-dd
    hoje: function() {
        var data = new Date(Date.now());
        var date = data.getFullYear() + '-' + (data.getMonth() + 1)+ '-' + data.getDate();
        //console.log("date", date);
        return date;
    },

    // eleminar RECURSO
    eliminar: function() {
        var recurso = this._getRecurso();
        if(!recurso.RECURSO_ID) return;
        if (!confirm("Eliminar o recurso '"+recurso.NOME+"'?")) { 
            console.log("eliminação do recurso '"+recurso.NOME+"' cancelada");
            return;
        }

        var Fichas = this;
        Fichas.recursos("delete/" + recurso.RECURSO_ID, function(json){
            console.log("delete/" + recurso.RECURSO_ID, json);

            if(json == true) {
                // limpar editor
                Fichas.novoRecurso();

                // atualizar a tabela
                Fichas.tabelaRecurso();

                // ... lista de preços
            }
        });
    },

    DISABLED_procurar: function() {
        var recurso = prompt("recurso a procurar", "areia");
        if(!recurso) return;
        var query = "query/SELECT * FROM RECURSO WHERE NOME LIKE '%25" + recurso + "%25'";
        this.tabelaRecurso(query);
    },

    //
    recurso: function(recurso) {
        if(typeof recurso != 'undefined') {
            // inserir recurso na bd
        }
    },

    // faz chamada Ajax ao controlador da base de dados
    recursos: function(url, done) {
        url = this.API.href(url);
        $.ajaxSetup({ beforeSend: this.API.xhrAuth() });// controller auth
        $.ajax({ type: "GET", dataType: "json", url: url }).done(done);
    },

    // ? 
    recursivo: function( json ) {
        for(var i = 0; i < json.length; i++){
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
        conf = conf || { hostname: "situs.pt", protocol: "https:", pathname: "/recursos" };
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

    delete_FORNECIMENTO: function(rid, callback) {
        var url = "fornecimento/delete/"+ rid;
        this.recursos(url, function(json) {
            console.log(url, json);
            if(callback) callback(json);
        });
    },

    delete_PRECO: function(fid, rid, callback) {
        var url = "preco/delete/" + fid + "/" + rid;
        this.recursos(url, function(json) {
            console.log(url, json);
            if(callback) callback(json);
            // atualizar lista de preços
            Frontgate.Apps("Fichas").precosRecurso("#PRECO-mosaicos ul", rid);
        });
    },

    eliminarPreco: function(e) {
        var input = $(this).parent().find("input")[0];
        var span = $(this).parent().find("span").text();
        var el = $(this).parent().parent()[0];
        var dataset = el.dataset;

        var msg = "Eliminar o PREÇO '"+ span + "' ("+dataset.valor+" €)?"
        if (!confirm(msg)) { 
            console.log("eliminação de PREÇO cancelada");
            return;
        }

        //
        var Fichas = Frontgate.Apps("Fichas");
        if(input.checked) {
            // eliminar FORNECIMENTO
            Fichas.delete_FORNECIMENTO(dataset.recurso_id, function(json) {
                if(json[0] == true) {
                    // eliminar PRECO
                    Fichas.delete_PRECO(dataset.fornecedor_id, dataset.recurso_id);
                }
            });
        }
        // eliminar PRECO
        else Fichas.delete_PRECO(dataset.fornecedor_id, dataset.recurso_id);
    },

    // 
    _limparPrecosRecurso: function(el) {
        $(el).html("<button onclick=\"$('#adicionar-preco').click();\"=>Adicionar Preço</button>");
    },

    _precosRecurso: function(el, items) {
        var html = _.template($("#RECURSO-PRECO-template").html(), { precos: items });
        $(el).append(html).each(function(index) {
            // preço do FORNECIMENTO do RECURSO
            if(items[index].fornece) $(this).find("input").click();
        });

        $(el).find("img.eliminar").click(this.eliminarPreco);
    },

    // coloca preços de um recurso no editor de recurso
    precosRecurso: function(el, id) {
        var Fichas = this;

        if(!id) {
            Fichas._limparPrecosRecurso(el);
            return;
        }

        Fichas.recursos("precos/"+id, function(json) {
            console.log("precos/"+id, json);
            if(!json.length) Fichas._limparPrecosRecurso(el);
            else {
                console.log("A Render Preços");
                $(el).html("");// limpar preços existente
                Fichas._precosRecurso(el, json);// render preços
            }
        });
    },

    //=========
    // RECURSO
    //=========

    // constroi a tabela RECURSO
    tabelaRecurso: function(query) {// query quado rende para uma procura
        var Fichas = this;
        $("#Recursos > ul.table.RECURSO").remove();
        Fichas.tableFromQuery(query || "RECURSO", "RECURSO", "#Recursos", function($el){
            // evento click nas linhas (recursos) da tabela
            $el.show().not(".header").find("ul.row").click(function(e) {
                // unselect selected row
                $el.find("ul.row").removeClass("selected");

                // select clicked row
                $(this).addClass("selected");

                // preenche o editor de recursos
                Fichas._setRecurso(Fichas._getRecurso($(this)));

                // atualizar painel de preços
                Fichas.precosRecurso("#PRECO-mosaicos ul", $(this).find("li.RECURSO-RECURSO_ID").text());
            });
        });
    },

    // limpa o editor de recursos
    novoRecurso: function() {
        //
        this._setRecurso(this._novoRecurso());
        //
        this._limparPrecosRecurso("#PRECO-mosaicos ul");
    },

    // validação de recurso existente
    _validarRecurso: function(recurso) {
        var dataset = $("#RECURSO")[0].dataset;

        if(recurso.nome != dataset.nome
            || recurso.tipo != dataset.tipo_codigo
            || recurso.unidade != dataset.unidade_codigo) return recurso;

        console.log("Recurso Sem Alteração");

        return false;
    },

    // validacão de recurso
    validarRecurso: function() {
        console.log("A Validar Recurso");
        var id = $("#RECURSO_ID").val();

        // nome
        var nome = $("#NOME").val();
        if(!nome) return false;

        // tipo
        var tipo = $("#TIPO_CODIGO").val();
        if(!tipo) return false;

        // unidade
        var unidade = $("#UNIDADE_CODIGO").val();
        if(!unidade) return false;

        var recurso = { nome: nome, tipo: tipo, unidade: unidade };
        if(id) {
            recurso.id = id;
            return this._validarRecurso(recurso);
        } 

        return recurso;
    },

    // INSERT RECURSO
    _insertRecurso: function(recurso) {
        var Fichas = this;
        var query = "query/SELECT * FROM RECURSO WHERE nome = '"+recurso.nome+"'";
        // verificar se já existe recurso com o mesmo nome
        Fichas.recursos(query, function(json) {
            // o recurso não existe: adicionar recurso
            if(!json.length) {
                console.log("Adicionar Recurso", recurso);
                var url = "recurso/" + recurso.nome + "/" + recurso.unidade + "/" + recurso.tipo;
                // adicionar recurso
                Fichas.recursos(url, function(json) {
                    if(json == true) {
                        // obter o recurso
                        Fichas.recursos(query, function(json) {
                            console.log(query, json);
                            Fichas._setRecurso(json[0]);
                            //Atualizar a tabela
                            Fichas.tabelaRecurso();
                        });
                    }
                    else console.log(url, json);
                });
            }
            // o recurso existe
            else console.log("recurso já existe", json);
        });
        return;
    },

    // UPDATE RECURSO
    _updateRecurso: function(recurso) {
        if(!recurso.id) return;
        var Fichas = this;
        var query = "query/SELECT * FROM RECURSO WHERE RECURSO_ID = "+recurso.id;
        // verificar se já existe recurso com o mesmo nome
        Fichas.recursos(query, function(json) {
            // o recurso existe: atualizar o recurso
            if(json.length) {
                console.log("Actualizar Recurso", recurso);
                var url = "recurso/"+ recurso.id + "/" + recurso.nome + "/" + recurso.unidade + "/" + recurso.tipo;
                // actualizar o recurso
                Fichas.recursos(url, function(json) {
                    if(json == true) {
                        // obter o recurso
                        Fichas.recursos(query, function(json) {
                            console.log(query, json);
                            
                            //Fichas._setRecurso(json[0]);
                            
                            // atualizar a tabela
                            Fichas.tabelaRecurso();
                        });
                    }
                    else console.log(url, json);
                });
                //Fichas.recursos();
            }
            // o recurso existe
            else console.log("recurso não existe", json);
        });
    },

    // atualizar (insert/update) recurso na BD
    atualizarRecurso: function() {
        var recurso = this.validarRecurso();

        if(!recurso) {
            console.log("O Recurso Não Passou Validação");
            return;
        }
        // recurso novo
        if(!recurso.id) return this._insertRecurso(recurso);
        // recurso existente
        return this._updateRecurso(recurso);
    },

    // objecto recurso vazio
    _recurso: ['RECURSO_ID', 'NOME', 'TIPO_CODIGO', 'UNIDADE_CODIGO', 'RECURSO_PRECO', 'USER', 'DATA_ATUALIZADO'],
    _novoRecurso: function() {
        var recurso = {};
        for(var i in this._recurso ) {
            var nome = this._recurso[i];
            if(nome == 'USER') recurso[nome] = this.user();
            else if(nome == 'DATA_ATUALIZADO') recurso[nome] = this.hoje();
            else recurso[nome] = "";
        } 
        console.log("recurso vazio", recurso);
        return recurso;
    },

    // obtém dados do recurso
    _getRecurso: function($ul) {
        // na linha (elemento ul)
        if($ul) return {
            RECURSO_ID: $ul.find("li.RECURSO-RECURSO_ID").text(),
            NOME: $ul.find("li.RECURSO-NOME").text(),
            TIPO_CODIGO: $ul.find("li.RECURSO-TIPO_CODIGO").text(),
            UNIDADE_CODIGO: $ul.find("li.RECURSO-UNIDADE_CODIGO").text(),
            RECURSO_PRECO: $ul.find("li.RECURSO-RECURSO_PRECO").text(),
            USER: $ul.find("li.RECURSO-USER").text(),
            DATA_ATUALIZADO: $ul.find("li.RECURSO-DATA_ATUALIZADO").text()
        };

        // no editor
        return {
            RECURSO_ID: $("#RECURSO_ID").val(),
            NOME: $("#NOME").val(),
            TIPO_CODIGO: $("#TIPO_CODIGO").val(),
            UNIDADE_CODIGO: $("#UNIDADE_CODIGO").val(),
            RECURSO_PRECO: $("#RECURSO_PRECO").val(),
            USER: $("#USER").val(),
            DATA_ATUALIZADO: $("#DATA_ATUALIZADO").val()
        };
    },

    // preenche o editor de Recursos
    _setRecurso: function(recurso) {
        //console.log("_setRecurso", recurso);
        // input fields
        $("#RECURSO_ID").val(recurso.RECURSO_ID);
        $("#NOME").val(recurso.NOME);
        $("#TIPO_CODIGO").val(recurso.TIPO_CODIGO);
        $("#UNIDADE_CODIGO").val(recurso.UNIDADE_CODIGO);
        $("#RECURSO_PRECO").val(recurso.RECURSO_PRECO);
        $("#USER").val(recurso.USER);
        var date = recurso.DATA_ATUALIZADO.split(" ")[0];
        $("#DATA_ATUALIZADO").val(date);
        // data attributes
        $("#RECURSO").attr({
            "data-RECURSO_ID": recurso.RECURSO_ID,
            "data-NOME": recurso.NOME,
            "data-TIPO_CODIGO": recurso.TIPO_CODIGO,
            "data-UNIDADE_CODIGO": recurso.UNIDADE_CODIGO,
            "data-RECURSO_PRECO": recurso.RECURSO_PRECO,
            "data-USER": recurso.USER,
            "data-DATA_ATUALIZADO": date
        });
    },

    // radios in #RECURSO_PRECO
    clickedRadio: function(el) {
        console.log("checked", el.checked);
        var $li = $(el).parent().parent();
        var preco = $li[0].dataset;
        var recurso = $("#RECURSO")[0].dataset;
        console.log("PRECO", preco);
        console.log("RECURSO", recurso);

        $('#RECURSO_PRECO').val(preco.valor);

        var Fichas = Frontgate.Apps("Fichas");
        var query = "query/SELECT * FROM FORNECIMENTO WHERE RECURSO_ID = "+recurso.recurso_id;
        console.log(query);
        if(1) Fichas.recursos(query, function(json) {
            console.log(query, json);
            var url = "fornecimento/"+preco.fornecedor_id+"/"+recurso.recurso_id;
            Fichas.recursos(url, function(json) {
                console.log(url, json);
                // true: fornecimento inserido
                if(json == false) console.log("Falha A INSERIR Fornecimento");
            });
        });
    },

    // Toolbox for Bar toolbox
    Toolbox: function(data) {
        var creator = this;
        this.data = data;

        var $body = $("#body");
        if(!$body.length) throw "missing div#body";
        this.$container = $("<div>").attr("id", data.toolbox.name).addClass("toolbox container");

        $body.append(this.$container);

        var selector = this.route = "#"+data.toolbox.name;

        this.onClick = null;
        this.onHash = null;

        // add a route for #Recursos location hash
        Frontgate.router.on(this.route, function(route) {
            if(route.res.input == selector) {
                $("div.toolbox.container").hide();
                creator.data.parent.toggle(selector, true);
            }
        });

        // Window is this in data_callbak
        var data_callback = data.callback;

        // FichasBar is this in data_callback
        //this.data_callback = data.callback;

        var callback = function(bar) {
            console.log("creator arguments", arguments);
            creator.bar = bar;

            //TODO add a container in the toolbox for panels
            //TODO ... or other solution to toggle panels in Bar
            // see more about hash event in Bar
            bar.navigator.subscribeEvent('hash', function(route){
                if(creator.onHash) creator.onHash(route);
            });

            bar.navigator.subscribeEvent('click', function(route){
                if(creator.onClick) creator.onClick(route);
            });

            if(data_callback) data_callback(bar, creator);
        };

        data.callback = callback;
        this.data.parent.$container.bar(data);

        this.procurar = function(query, msg, val) {
            var needle = prompt(msg || "valor a procurar", val || "");
            if(!needle) return;
            query = "query/" + query.replace("{needle}", needle);
            this.data.parent.fichas.tabelaRecurso(query);
        };

        // ...
    },

    // Toolbar for Bar toolbar
    Toolbar: function(data) {
        var self = this;
        this.data = data;

        var $body = $("#body");
        if(!$body.length) throw "missing div#body";
        $body.html("");
        this.$container = $("<div>").attr("id", data.toolbar.name).addClass("toolbar");
        $body.append(this.$container);
        this.route = "#"+data.toolbar.name;

        // overiding callback in toolbar data
        var data_callback = data.toolbar.callback;// Window is this in data_callbak
        //this.data_callback = data.callback;// FichasBar is this in data_callback
        var callback = function(bar) {
            self.bar = bar;
            if(data_callback) data_callback(bar, this);
        };
        data.toolbar.callback = callback;

        this.$container.bar(data.toolbar);

        //TODO ...
        this.fichas = Frontgate.Apps(data.toolbar.name);

        this.toggle = function(selector, flag) {
            if(flag) $(selector).fadeIn();
            else $(selector).fadeOut();
        };

        var _toolboxes = {};
        this.toolbox = function(name, toolbox) {
            if(!name) return;// _toolboxes;
            if(!toolbox) return _toolboxes[name];
            _toolboxes[name] = toolbox;
        };

        //TODO move fichas methods
        this.fichas.recursos("init", function(json) {
            //console.log("this", this);
            self.fichas.FICHAS = json;
            for(var toolbox in data.toolboxes) {
                var toolbox_data = data.toolboxes[toolbox];
                //toolbox_data.toolbar = self.data.toolbar;
                toolbox_data.parent = self;
                self.toolbox(toolbox, new Toolbox(toolbox_data));
            }
        });

        // ...
    }
});