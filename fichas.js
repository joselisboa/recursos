//
// Recursos aka 'Fichas de Rendimento' database using jQuery Bar, FrontgateJS, and Situs PHP Framework
//
// Description: Prototype Interface for a (BD) School Project
// Author: José Vieira Lisboa
// E-mail: jose.vieira.lisboa@gmail.com
// Webpage: https://situs.pt/recursos
//

(function(data) {

    $("#D1").attr({
        min: "2000-01-01",
        max: Frontgate.Apps(data.toolbar.name).hoje()
    });

    window.Fichas = new Toolbar(data);

})({
    toolbar: {
        name: "Fichas",
        //container: "#fichas",
        items: [{
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
        callback: function(bar) {
            //console.log(this, arguments);
            this.bar = bar;
            //
            $("#user").text(Frontgate.Apps("Fichas").user());
            $("#user-a").parent().css("float","right");
        }
    },
    toolboxes: {
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
                    attr: {
                        href: "#Recursos/novo"
                    },
                    click: function() {
                        //Fichas.fichas.novoRecurso();
                        //Fichas.toolbox("recursos").novo();
                        //return false;
                    }
                },
                {// update
                    //text: "Aplicar",
                    html: '<img src="icons/16/lightning.png"> Aplicar',
                    css: {
                        cursor: "pointer"
                    },
                    attr: {
                        href: "#Recursos/atualizar/RECURSO_ID/NOME,UNIDADE_CODIGO,TIPO_CODIGO"
                    },
                    _click: function() {
                        //console.log(this.innerHTML);
                        Fichas.toolbar("recursos").atualizar();
                    }
                },
                {// delete
                    //text: "Eliminar",
                    html: '<img src="icons/16/close.png"> Eliminar',
                    css: { cursor: "pointer" },
                    attr: {
                        href: "#Recursos/delete/RECURSO_ID/NOME"
                    }
                },
                {
                    //text: "Procurar",
                    html: '<img src="icons/16/search.png"> Procurar',
                    css: { cursor: "pointer" },
                    click: function() {
                        var query = "SELECT * FROM RECURSO WHERE NOME LIKE '%25{needle}%25'";
                        Fichas.toolbox("recursos").procurar(query, "recurso a procurar", "");
                    }
                },
                {
                    //text: "Adicionar Preço",
                    html: '<img src="icons/16/add.png"> Adicionar Preço',
                    attr: { id: "adicionar-preco" },
                    css: { cursor: "pointer" },
                    click: function() {
                        //console.log(this.innerHTML);
                        var id = $("#RECURSO_ID").val();
                        var nome = $("#NOME").val();
                        //TODO validate recurso (create recurso first)
                        if(!id) {
                            console.log("O Recurso Ainda não Existe");
                            return;
                        }

                        var $precos = $("#PRECO-mosaicos li.PRECO");

                        $("#PRECO-RECURSO_ID").attr("data-recurso_id", id).val(nome);

                        $("#add-preco > ul.table.FORNECEDOR").remove();
                        Fichas.fichas.tabela("FORNECEDOR", "#add-preco", function($el) {
                            var rows =  $el[1];// body

                            // rows => ul.body > li ul.row > li
                            $(rows).find("ul.row").each(function(index){
                                var row = this;
                                $precos.each(function(xindex){
                                    if(Fichas.fichas.fornecedor(row).id == this.dataset.fornecedor_id) $(row).parent().remove();
                                });
                            });

                            if(!$(rows).find('li').length) {
                                console.log("Não Existem Fornecedores Para O Fornecimento");
                                return;
                            }

                            $el.show().not(".header").find("ul.row").click(function(e) {
                                $el.find("ul.row").removeClass("selected");// unselect selected row
                                $(this).addClass("selected");// select clicked row
                                var fornecedor = Fichas.fichas.fornecedor(this);
                                console.log("PRECO > FORNECEDOR", fornecedor);
                                $("#F1").attr("data-fornecedor_id", fornecedor.id).val(fornecedor.nome);
                            });

                            $("#overlay div").hide();
                            $("#add-preco").show();
                            $("#overlay").fadeIn();
                        });
                    }
                },
                {
                    //text: "Atributos Privados",
                    html: '<img src="icons/16/eye.png">',
                    css: { cursor: "pointer" },
                    click: function() {
                        Fichas.fichas.togglePrivateAttr("#RECURSO");
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
                        var url = "preco/"+recurso_id+"/"+fornecedor_id+"/"+valor+"/"+data;
                        Fichas.fichas.recursos(url, function(json) {
                            //TODO refrescar recurso
                            console.log(url, json);

                            //precosRecurso: function(el, id)
                            Fichas.fichas.precosRecurso("#PRECO-mosaicos ul", recurso_id);

                            // voltar ao editor
                            $("#overlay").fadeOut();
                        });
                        // done
                        console.info(this.innerHTML, "waiting ...");
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
            // callback for Recursos
            callback: function(bar, toolbox){
                toolbox.entity("RECURSO");
                toolbox.attributes([
                    'RECURSO_ID',
                    'NOME',
                    'TIPO_CODIGO',
                    'UNIDADE_CODIGO',
                    'RECURSO_PRECO',
                    'USER',
                    'DATA_ATUALIZADO']);

                // adicionar o template do editor ao div principal
                toolbox.$container.append(_.template($("#recurso").html(), {
                    //items: [Fichas.fichas._novoRecurso()]
                    items: [toolbox._novo()]
                }));

                // não mostrar campos privados
                $("#RECURSO_PRECO, #USER, #DATA_ATUALIZADO, #RECURSO_ID")
                    .attr("disabled", "disabled").parent().addClass("private");

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
                    items: Fichas.fichas.FICHAS.Tables.TIPO
                }));

                // desativar o tipo COMPOSTO
                $('#TIPO_CODIGO option[value="COM"]').attr("disabled","disabled");

                // lista de unidades
                $("#UNIDADE_CODIGO").html(_.template($("#unidade_option").html(), {
                    items: Fichas.fichas.FICHAS.Tables.UNIDADE
                }));

                Fichas.fichas.togglePrivateAttr("#RECURSO", true);

                // preparar editos de recursos
                toolbox.novo();

                // criar tabela de recursos
                toolbox.tabela();//Fichas.fichas.tabelaRecurso();

                // precos
                Fichas.fichas.precosRecurso("#PRECO-mosaicos ul");
            }
        },
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
            // callback de Fornecedores
            callback: function(bar, toolbox) {
                toolbox.$container.append(_.template($("#fornecedores").html(), {
                    items:[{ FORNECEDOR_ID: "", FORNECEDOR_NOME: "", FORNECEDOR_MORADA: ""}]
                }));

                $("#FORNECEDOR_ID").attr("disabled", "disabled");

                Fichas.fichas.recursos("/FORNECEDOR", function(json){
                    console.log("/fornecedor", json);
                })
            }
        }
    }
});
