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
                    items[k] = {
                        name: name, value: value,
                        "class": table+"-"+name//TODO rever nome da class
                    };
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

            if(callback) callback($(selector));
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
        this.data = data;
        var creator = this;
        var parent = this.data.parent;

        var $body = $("#body");
        if(!$body.length) throw "missing div#body";
        this.$container = $("<div>").attr("id", data.toolbox.name).addClass("toolbox container");

        $body.append(this.$container);

        var selector = this.route = "#"+data.toolbox.name;

        this.onClick = null;
        this.onHash = null;

        // constroi a tabela RECURSO
        this.tabela = function(query) {// query quado rende para uma procura
            var table_name = this.entity();
            var Fichas = parent.fichas;
            //"#Recursos > ul.table.RECURSO"
            $(selector + " > ul.table." + table_name).remove();
            Fichas.tableFromQuery(query || table_name, table_name, selector, function($el){
                // evento click nas linhas (recursos) da tabela
                $el.show().not(".header").find("ul.row").click(function(e) {
                    // unselect selected row
                    $el.find("ul.row").removeClass("selected");

                    // select clicked row
                    $(this).addClass("selected");

                    // atualiza hash
                    var recurso = creator.get($(this))
                    location.hash = selector + "/"+recurso.RECURSO_ID;

                    // preenche o editor de recursos
                    creator.set(recurso);

                    // atualizar painel de preços
                    Fichas.precosRecurso("#PRECO-mosaicos ul", $(this).find("li.RECURSO-RECURSO_ID").text());
                });
            });
        };

        var _attributes = [];
        this.attributes = function(attrs) {
            // getter
            if(!attrs) return _attributes;
            // nok
            if(!attrs.length) return false;
            // setter
            for(var i=0; i < attrs.length; i++) {
                var attribute = attrs[i];
                 if(typeof attribute != "string") throw "invalid attribute";
                for(var j = 0; j < _attributes.length; j++ ) {
                    // já existe
                    if(attribute == _attributes[j]) break;
                }
                if(j < _attributes.length ) continue;
                _attributes[_attributes.length] = attribute;
            }
            // ok
            return true;
        };

        // valida os valores a atribuir [this.set] (alternativa ao argumento validate)
        //TODO onSet
        this.validate = function(attribute, value) {
            switch(attribute) {
                //case 'USER': return parent.fichas.user();
                case 'DATA_ATUALIZADO': return value.split(" ")[0];
                default: return value;
            }
        };

        //TODO onNew
        this.validateNew = function(attribute, value) {
            if(attribute == "DATA_ATUALIZADO") return parent.fichas.hoje().split(" ")[0];
            else if(attribute == "USER") return parent.fichas.user();
            return value;
        };

        this._novo = function() {
            console.log("Toolbox._novo();");
            var entity = {};
            for(var i in _attributes) {
                var value = "";
                entity[_attributes[i]] = value;
            }
            return entity;
        }

        // limpa o editor
        this.novo = function() {
            console.log("Toolbox.novo();");
            this.set(this._novo(), this.validateNew);
            //TODO limpar mosaicos
            parent.fichas._limparPrecosRecurso("#PRECO-mosaicos ul");
        };

        // obtém dados do recurso
        this.get = function($ul) {
            var table_name = this.entity();
            //console.log("Toolbox.get();");
            var entity = {};
            for(var i in _attributes) {
                if($ul) entity[_attributes[i]] = $ul.find("li."+table_name+"-"+_attributes[i]).text();
                else entity[_attributes[i]] = $("#"+_attributes[i]).val();
            }
            return entity;
        };

        // preenche o editor de Recursos
        this.set = function(entity, validate) {
            var table_name = this.entity();
            var attributes = this.attributes();
            for(var i in attributes) {
                var attribute = attributes[i];
                var value = entity[attribute];
                if(validate) value = validate(attribute, value);
                else if(this.validate) value = this.validate(attribute, value);
                $("#"+attribute).val(value);//TODO rename selector
                $("#"+table_name).attr("data-"+attribute , value);
            }
        };

        // table name
        var _entity = null;
        this.entity = function(name) {
            if(!name) {
                if(!_entity) throw "table name is not set";
                return _entity;
            }
            _entity = name;
        };

        // (sql) conditions
        var _conditions = [];
        this.conditions = function(conditions){
            if(!conditions) return _conditions;
            for(var i=0; i < conditions.length; i++) {
                _conditions[_conditions.length] = conditions[i];
            }
        };

        // eleminar RECURSO
        //var _delete = function() {}
        this.delete = function(id, nome) {
            console.log("Toolbox.delete();");
            var tableName = this.entity();
            var entity = this.get();

            if(!entity[id]) {
                console.error("nothing to delete");
                return;
            }

            if (!confirm("Eliminar a entidade '"+entity[nome]+"'?")) {
                console.log("eliminação da entidade '"+entity[nome]+"' cancelada");
                return;
            }

            parent.fichas.recursos("delete/"+entity[id], function(json) {
                console.log("delete/"+entity[id], json);
                if(json[0] == true) {
                    // limpar editor
                    //creator.novo();
                    Frontgate.router.route(creator.route+"/novo");

                    // atualizar a tabela
                    creator.tabela();//parent.fichas.tabelaRecurso();

                    // ... lista de preços
                }
            });
        };

        // INSERT RECURSO
        this._insert = function(record, validate) {
            var fichas = parent.fichas;
            var name = validate[0];
            var query = "query/SELECT * FROM "+this.entity()+" WHERE "+name+" = '"+record[name]+"'";
            // verificar se já existe recurso com o mesmo nome
            fichas.recursos(query, function(json) {
                // o recurso não existe: adicionar recurso
                if(!json.length) {
                    console.log("Adicionar Registo", record);
                    var url = creator.entity().toLowerCase();
                    for(var i in validate) url = url + "/" + record[validate[i]];

                    // adicionar recurso
                    fichas.recursos(url, function(json) {
                        if(json == true) {
                            // obter o recurso
                            fichas.recursos(query, function(json) {
                                console.log(query, json);
                                creator.set(json[0]);
                                creator.tabela();//Atualizar a tabela
                            });
                        }
                        else console.log(url, json);
                    });
                }
                // o recurso existe
                else console.log("registo já existe", json);
            });
            return;
        };
        //*/

        // UPDATE RECURSO
        this._update = function(record, id, validate) {
            var fichas = parent.fichas;
            var query = "query/SELECT * FROM "+creator.entity()+" WHERE "+id+" = "+record[id];
            // verificar se já existe recurso com o mesmo nome
            fichas.recursos(query, function(json) {
                // o recurso existe: atualizar o recurso
                if(json.length) {
                    console.log("Actualizar Registo", record);
                    var url = creator.entity().toLowerCase()+"/" + record[id];;
                    for(var i in validate) url = url + "/" + record[validate[i]];

                    // actualizar o recurso
                    fichas.recursos(url, function(json) {
                        if(json == true) {
                            // obter o recurso
                            fichas.recursos(query, function(json) {
                                console.log(query, json);
                                // atualizar a tabela
                                creator.tabela();//Fichas.tabelaRecurso();
                            });
                        }
                        else console.log(url, json);
                    });
                    //Fichas.recursos();
                }
                // o recurso existe
                else console.log("registo não existe", json);
            });
        };
        //*/

        // atualizar (insert/update) recurso na BD
        this.atualizar = function(id, validate) {
            var record = this.validar(id, validate);

            if(!record) {
                console.error("O Recurso Não Passou Validação");
                return;
            }

            // recurso novo
            if(!record[id]) return this._insert(record, validate);
            // recurso existente
            return this._update(record, id, validate);
        };

        // validação de recurso existente
        // this.validate WILL FAIL
        this._validar = function(entity, validate) {
            var dataset = $("#"+_entity)[0].dataset;
            for(var i=0; i < validate.length; i++) {
                var attribute = validate[i];
                //console.log(attribute, dataset[attribute.toLowerCase()]);
                if(entity[attribute] != dataset[attribute.toLowerCase()]) return entity;
            }

            console.info("Entidade Sem Alteração");
            return false;
        };

        // validacão de recurso
        this.validar = function(id, validate) {
            console.log("A Validar Atributos", validate);
            var entity = {};
            for(var i in _attributes) {
                var attribute = _attributes[i];
                entity[attribute] = $("#"+attribute).val();
            }

            for(var i=0; i < validate.length; i++)
                if(!entity[validate[i]]) return false;

            if(!entity[id]) return entity;
            return this._validar(entity, validate);
        };

        //--------
        // ROUTES
        //--------

        // NEW
        Frontgate.router.on(this.route + "/novo", function(route) { creator.novo(); });

        // DELETE
        Frontgate.router.on(this.route + "/delete/:id/:name", function(route) {
            //console.log("DELETE", route);
            creator.delete(route.attr.id, route.attr.name);
        });

        // UPDATE
        Frontgate.router.on(this.route + "/atualizar/:id/:validate", function(route) {
            location.hash = creator.route;
            creator.atualizar(route.attr.id, route.attr.validate.split(","));
        });

        // add a route for <Toolbox.route> location hash
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
            creator.tabela();//this.data.parent.fichas.tabelaRecurso(query);
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
            Frontgate.router.route("#Recursos");
        });

        // ...
    }
});
//811
