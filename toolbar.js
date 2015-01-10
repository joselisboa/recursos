//
// Recursos aka 'Fichas de Rendimento' database using jQuery Bar, FrontgateJS, and Situs PHP Framework
//
// Description: Prototype Interface for a (BD) School Project
// Author: José Vieira Lisboa
// E-mail: jose.vieira.lisboa@gmail.com
// Webpage: https://situs.pt/recursos
//

// Toolbox for Bar toolbox
window.Toolbox = function(data) {
    var $body = $("#body");
    if(!$body.length) throw "missing div#body";

    this.data = data;
    var creator = this;
    var parent = this.data.parent;
    var selector = this.route = "#"+data.toolbox.name;
    var _entity = null;
    var _attributes = [];

    //TODO make private
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

    this.$container = $("<div>").attr("id", data.toolbox.name).addClass("toolbox container");

    $body.append(this.$container);

    this.onClick = null;
    this.onHash = null;

    // esconder campos privados
    this.private = function(data) {
        if(typeof data == "object" && data.length) {
            //alert("private fields");
            for(var i in data)
                $("#"+_entity+"-"+data[i]).attr("disabled", "disabled").parent().addClass("private");
            return this;
        }
        if(!selector) return;
        data = data || $(selector + " li.private").is(":visible");
        if(data) $(selector + " li.private").hide();
        else $(selector + " li.private").show();
        return this;
    };

    this.placeholder = function(data) {
        for (var name in data) $("#"+_entity+"-"+ name).attr("placeholder", data[name]);
        return this;
    };

    this.on = function(name, f) {
        this.on[name] = f;
        return this;
    };

    // constroi a tabela
    this.tabela = function(query) {// query quado rende para uma procura
        var table_name = this.entity();
        query = query || table_name;
        var Fichas = parent.fichas;
        //"#Recursos > ul.table.RECURSO"
        $(selector + " > ul.table." + table_name).remove();

        console.log("Toolbox.tabela("+query+");// query:", query, ", selector:", selector, ", table_name:", table_name);

        Fichas.tableFromQuery(query, table_name, selector, function($el) {

            // toolbox.on.table.row.click(function(){});
            if(creator.on.tableRows) creator.on.tableRows($el[1]);

            // evento click nas linhas (recursos) da tabela
            $el.show().not(".header").find("ul.row").click(function(e) {
                // unselect selected row
                $el.find("ul.row").removeClass("selected");

                // select clicked row
                $(this).addClass("selected");

                // atualiza hash
                var record = creator.get($(this))
                location.hash = selector + "/"+record[_attributes[0]];//.RECURSO_ID;

                // preenche o editor de recursos
                creator.set(record);

                // this é o registo (a linha)
                if(creator.on.tabela) creator.on.tabela(this);
            });
        });
        return this;
    };
    var _columns = [];
    this.columns = function (each) {
        if(each) {
            var columns = [];
            for(var i in _columns)
                columns[columns.length] = each(i, _columns[i]);
            return columns;
        }
        return _columns;
    }

    this.fields = function() {
        return this.columns(function(i, column) {
            return column.Field;
        });
    };

    // table name
    this.entity = function(name, callback) {
        if(!name) {
            if(!_entity) throw "table name is not set";
            return _entity;
        }
        _entity = name;
        Fichas.fichas.recursos("query/SHOW COLUMNS FROM "+_entity, function(json) {
            _columns = json;
            creator.attributes(creator.fields());

            // adicionar o template do editor ao div principal
            var template = $(_.template($("#template-"+_entity).html(), {
                items: [creator._novo()]
            }));

            for(var i in _attributes) $(template).attr("data-" + _attributes[i], "");
            creator.$container.append(template);


            if(callback) callback();

            console.log(_entity, json);
        });
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
        if(this.on.novo) this.on.novo();
        return this;
    };

    // obtém dados do recurso
    this.get = function($ul) {
        var table_name = this.entity();
        //console.log("Toolbox.get();");
        var entity = {};
        for(var i in _attributes) {
            if($ul) entity[_attributes[i]] = $ul.find("li."+table_name+"-"+_attributes[i]).text();
            else entity[_attributes[i]] = $("#"+table_name+"-"+_attributes[i]).val();
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

            $("#"+table_name+"-"+attribute).val(value);//TODO rename selector
            $("#"+table_name).attr("data-"+attribute , value);
        }
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
        var table_name = this.entity();
        var entity = this.get();

        if(!entity[id]) {
            console.error("nothing to delete");
            return this;
        }

        if(!confirm("Eliminar a entidade '"+entity[nome]+"'?")) {
            console.log("eliminação da entidade '"+entity[nome]+"' cancelada");
            return this;
        }
        var url = table_name + "/delete/" + entity[id]
        parent.fichas.recursos(url, function(json) {
            console.log(url, json);
            if(json == true) {
                // limpar editor
                location.hash = creator.route+"/novo";
                // atualizar a tabela
                creator.tabela();//parent.fichas.tabelaRecurso();
                // ... lista de preços
            }
        });

        return this;
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
                            // preencher editor
                            creator.set(json[0]);
                            if(creator.on.recursoChange) creator.on.recursoChange();
                            // atualizar a tabela
                            creator.tabela();
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
        var dataset = $("#"+this.entity())[0].dataset;
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
            entity[attribute] = $("#"+this.entity()+"-"+attribute).val();
        }

        for(var i=0; i < validate.length; i++)
            if(!entity[validate[i]]) return false;

        if(!entity[id]) return entity;
        return this._validar(entity, validate);
    };

    //--------
    // ROUTES
    //--------

    // SEARCH
    Frontgate.router.on(this.route + "/search/:nome", function(route) {
        location.hash = creator.route;
        var query = "SELECT * FROM "+creator.entity()+" WHERE "+route.attr.nome+" LIKE '%25{needle}%25'";
        creator.procurar(query, "recurso a procurar", "");
    });

    // NEW
    Frontgate.router.on(this.route + "/novo", function(route) {
        location.hash = creator.route;
        creator.novo();
    });

    // PRIVATE
    Frontgate.router.on(this.route + "/private", function(route) {
        location.hash = creator.route;
        creator.private();
    });

    // CANCEL (return from overlay)
    Frontgate.router.on(this.route + "/cancel", function(route) {
        location.hash = creator.route;
        $("#overlay").fadeOut();
    });

    // DELETE
    Frontgate.router.on(this.route + "/delete/:id/:name", function(route) {
        //console.log("DELETE", route);
        location.hash = creator.route;
        creator.delete(route.attr.id, route.attr.name);
    });

    // UPDATE
    Frontgate.router.on(this.route + "/atualizar/:id/:validate", function(route) {
        location.hash = creator.route;
        var validate = route.attr.validate.split(",");
        creator.atualizar(route.attr.id, validate);
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
        creator.tabela(query);
    };
};

// Toolbar for Bar toolbar
window.Toolbar = function(data, callback) {
    var self = this;
    this.data = data;

    var $body = $("#body");
    if(!$body.length) throw "missing div#body";
    $body.html("");
    this.$container = $("<div>").attr("id", data.toolbar.name).addClass("toolbar");
    $body.append(this.$container);
    this.route = "#"+data.toolbar.name;

    // overiding callback in toolbar data
    var data_callback = data.toolbar.callback;
    var callback = function(bar) {
        self.bar = bar;
        if(data_callback) data_callback(bar, this);// context is Window
    };
    data.toolbar.callback = callback;

    this.$container.bar(data.toolbar);

    //TODO alternate way to access fichas app
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
        self.DB = {
            name: "FICHAS",
            tables: {}
        };

        //console.log("this", this);
        self.fichas.FICHAS = json;
        for(var toolbox in data.toolboxes) {
            var toolbox_data = data.toolboxes[toolbox];
            //toolbox_data.toolbar = self.data.toolbar;
            toolbox_data.parent = self;
            self.toolbox(toolbox, new Toolbox(toolbox_data));
        }

        $("#user").text(self.fichas.user());

        self.fichas.tabelas(self.$container);

        Frontgate.router.route("#Recursos");
    });
};
