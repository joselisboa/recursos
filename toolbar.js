//
// Recursos aka 'Fichas de Rendimento' database using jQuery Bar, FrontgateJS, and Situs PHP Framework
//
// Description: Prototype Interface for a (BD) School Project
// Author: José Vieira Lisboa
// E-mail: jose.vieira.lisboa@gmail.com
// Webpage: https://situs.pt/recursos
//
// toolbar da Barra 'Fichas de Rendimento'
(function(fichas){
    var Fichas = Frontgate.Apps("Fichas");
    Fichas.toolbar = fichas.toolbar;
    Fichas.toolboxes = fichas.toolboxes;
    Fichas.recursos("init", function(json){
        Fichas.FICHAS = json;

        // toolboxes
        $("#fichas")// #fichas div will be created if it doesn't exist
        .bar(Fichas.toolbar)
        .bar(Fichas.toolboxes.recursos)// Recursos 
        .bar(Fichas.toolboxes.compostos)// Compostos
        .bar(Fichas.toolboxes.fornecedores)// Fornecedores
        ;//.css("opacity", .9).panel().css("padding", 0).find('ul.panel-header').hide();//.width("auto");//

        Fichas.tabelas(Fichas.FICHAS.Tables_in_FICHAS);// Tabelas
    });
})({
    toolbar: {
        items:[{ 
            text: "Fichas de Rendimento"
        }, 
        { 
            //text: "",
            html: '<img style="vertical-align: middle;" src="icons/16/user.png"> <span id="user"></span>',
            attr: { id: "user-a" },
            css: {
                "font-size":"14px",
                color:"rgba(0,0,0,.5)"
            }
        }],
        callback: function() {
            //
            $("#user").text(Frontgate.Apps("Fichas").user());
            $("#user-a").parent().css("float","right");
        }
    },
    toolboxes: {
        compostos: {
            toolbox: {
                name: "Compostos",
                items: [
                {// put
                    text: "Novo Composto",
                    click: function() {
                        console.log(this.innerHTML);
                    }
                },
                {// update
                    text: "Atualizar",
                    click: function() {
                        console.log(this.innerHTML);
                    }
                },
                {
                    text: "Procurar",
                    click: function() {
                        console.log(this.innerHTML);
                    }
                },
                {// delete
                    text: "Eliminar",
                    click: function() {
                        console.log(this.innerHTML);
                    }
                }]
            }
        },
        fornecedores: {
            toolbox: {
                name: "Fornecedores",
                items: [{
                    text:"Novo",
                    attr:{
                        title: "Adicionar Fornecedor",
                        href: "#FornecedorNovo"
                    }
                },
                {
                    text:"Editar",
                    attr:{
                        title: "Editar Fornecedor",
                        href: "#FornecedorEditar"
                    }
                },
                {
                    text:"Eliminar",
                    attr:{
                        title: "Eliminar Fornecedor",
                        href: "#FornecedorEliminar"
                    },
                    click: function(){
                        // returning false prevents default
                        // will not set location.hash
                        alert("preventing default");
                        return false;
                    }
                }]
            },
            callback: function(bar) {
                                        var dummies = [];
                for(var i=0; i<3; i++) {
                    dummies[i] = { dummy: "DUMMY " + (i + 1)};
                }
                var Fichas = Frontgate.Apps("Fichas");
                var template = _.template($("#fornecedores").html(), { items:[{
                    FORNECEDOR_ID: "",
                    FORNECEDOR_NOME: "",
                    FORNECEDOR_MORADA: ""
                }], contactos: dummies, fornecedores: dummies });

                $('#body').append(template);

                $("#FORNECEDOR_ID").attr("disabled", "disabled");

                Fichas.recursos("/FORNECEDOR", function(json){
                    console.log("/fornecedor", json);
                })

                // add a route for #Recursos location hash
                Frontgate.router.route("#Fornecedores", function(){
                    console.log("#Fornecedores hash", arguments);
                });

                //TODO add a container in the toolbox to put panels, etc
                //TODO or other solution to toggle panel(s) in Bar
                // panel Toggle
                bar.navigator.subscribeEvent('hash', function(route){
                    Frontgate.Apps("Fichas").togglePanel("#Fornecedores", route.res.input == '#Fornecedores');
                });
            }
        },

        recursos: {
            toolbox: {
                //App: {},// to get with Frontgate.Apps("Recursos")
                name: "Recursos",
                items: [
                {// put
                    //text: "Novo Recurso",
                    html: '<img src="icons/16/document.png"> Novo Recurso',
                    css: {
                        cursor: "pointer"
                    },
                    click: function() {
                        Frontgate.Apps("Fichas").novoRecurso();
                        //console.log(this.innerHTML);
                    }
                },
                {// update
                    //text: "Aplicar",
                    html: '<img src="icons/16/lightning.png"> Aplicar',
                    css: {
                        cursor: "pointer"
                    },
                    click: function() {
                        Frontgate.Apps("Fichas").atualizarRecurso();
                        //console.log(this.innerHTML);
                    }
                },
                {// delete
                    //text: "Eliminar",
                    html: '<img src="icons/16/close.png"> Eliminar',
                    css: { cursor: "pointer" },
                    click: function() {
                        Frontgate.Apps("Fichas").eliminar();
                    }
                },
                {//
                    //text: "Procurar",
                    html: '<img src="icons/16/search.png"> Procurar',
                    css: { cursor: "pointer" },
                    click: function() {
                        Frontgate.Apps("Fichas").procurar();
                    }
                },
                {//
                    //text: "Adicionar Preço",
                    html: '<img src="icons/16/add.png"> Adicionar Preço',
                    attr: { id: "adicionar-preco" },
                    css: { cursor: "pointer" },
                    click: function() {
                        var id = $("#RECURSO_ID").val();
                        var nome = $("#NOME").val();
                        //TODO validate recurso (create recurso first)
                        if(!id) {
                            console.log("O Recurso Ainda não Existe");
                            return;
                        }

                        var $precos = $("#PRECO-mosaicos li.PRECO");

                        $("#PRECO-RECURSO_ID").attr("data-recurso_id", id).val(nome);

                        var Fichas = Frontgate.Apps("Fichas");
                        $("#add-preco > ul.table.FORNECEDOR").remove();
                        Fichas.tabela("FORNECEDOR", "#add-preco", function($el) {
                            var rows =  $el[1];// body

                            // rows => ul.body > li ul.row > li 
                            $(rows).find("ul.row").each(function(index){
                                var row = this;
                                $precos.each(function(xindex){
                                    if(Fichas.fornecedor(row).id == this.dataset.fornecedor_id) $(row).parent().remove();
                                });
                            });

                            if(!$(rows).find('li').length) {
                                console.log("Não Existem Fornecedores Para O Fornecimento");
                                return;
                            }

                            $el.show().not(".header").find("ul.row").click(function(e) {
                                $el.find("ul.row").removeClass("selected");// unselect selected row
                                $(this).addClass("selected");// select clicked row
                                var fornecedor = Fichas.fornecedor(this);
                                console.log("PRECO > FORNECEDOR", fornecedor);
                                $("#F1").attr("data-fornecedor_id", fornecedor.id).val(fornecedor.nome);
                            });

                            $("#overlay div").hide();
                            $("#add-preco").show();
                            $("#overlay").fadeIn();
                        });
                        
                        console.log(this.innerHTML);
                    }
                },
                {
                    //text: "Atributos Privados",
                    html: '<img src="icons/16/eye.png">',
                    css: { cursor: "pointer" },
                    click: function() {
                        Frontgate.Apps("Fichas").togglePrivateAttr("#RECURSO");
                    }
                },
                {
                    text: "ok-add-preco",
                    attr: { id: "ok-add-preco" },
                    css: { display: "none" },
                    click: function(e){
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
                        var Fichas = Frontgate.Apps("Fichas");
                        var url = "preco/"+recurso_id+"/"+fornecedor_id+"/"+valor+"/"+data;
                        Fichas.recursos(url, function(json) {
                            //TODO refrescar recurso
                            console.log(url, json);
                            
                            //precosRecurso: function(el, id)
                            Fichas.precosRecurso("#PRECO-mosaicos ul", recurso_id);
                            
                            // voltar ao editor
                            $("#overlay").fadeOut();
                        });
                        // done
                        console.log(this.innerHTML, "waiting ...");
                    }
                },
                {
                    text: "cancel-add-preco",
                    attr: { id: "cancel-add-preco" },
                    css: { display: "none" },
                    click: function(){
                        console.log(this.innerHTML);
                        $("#overlay").fadeOut();
                    }
                }],
                // disabled with _
                _validate: function(item) {
                    console.log("#fichas toolbox item ", item);
                }
            },

            callback: function(bar){//bar.navigator.subscribeEvent("click", function(){});
                // Objecto que contém as funções
                var Fichas = Frontgate.Apps("Fichas");

                // template do editor de recursos
                var $template = $(_.template($("#recurso").html(), { items: [Fichas._novoRecurso()] }));

                // adicionar o template ao div principal
                $template.appendTo('#body');
                //$('#body').append(template);

                // não mostrar campos privados
                $("#RECURSO_PRECO, #USER, #DATA_ATUALIZADO, #RECURSO_ID")
                    .attr("disabled", "disabled").parent().addClass("private");//.hide();

                //
                $("#RECURSO_ID").attr({
                    "placeholder": "#"
                });

                $("#NOME").attr({
                    "placeholder": "Nome"
                });

                $("#RECURSO_PRECO").attr({
                    "placeholder": "€"
                });

                $("#DATA_ATUALIZADO").attr({
                    "min": "2015-01-01",
                    "max": "2015-12-31",
                    "type": "date"
                });

                // lista de tipos
                $("#TIPO_CODIGO").html(_.template($("#tipo_option").html(), {
                    items: Fichas.FICHAS.Tables.TIPO
                }));

                // desativar o tipo COMPOSTO
                $('#TIPO_CODIGO option[value="COM"]').attr("disabled","disabled");

                // lista de unidades
                $("#UNIDADE_CODIGO").html(_.template($("#unidade_option").html(), {
                    items: Fichas.FICHAS.Tables.UNIDADE
                }));

                Fichas.togglePrivateAttr("#RECURSO", true);

                // preparar editos de recursos
                Fichas.novoRecurso();

                // criar tabela de recursos
                Fichas.tabelaRecurso();

                // precos
                Fichas.precosRecurso("#PRECO-mosaicos ul");

                // add a route for #Recursos location hash
                Frontgate.router.route("#Recursos", function(){
                    console.log("#Recursos hash", arguments);
                });

                //TODO add a container in the toolbox for panels ... or other solution to toggle panels in Bar
                bar.navigator.subscribeEvent('hash', function(route) {
                    $("div.container").hide();
                    Frontgate.Apps("Fichas").togglePanel("#Recursos", route.res.input == '#Recursos');
                });
            }
        }
    }
});
