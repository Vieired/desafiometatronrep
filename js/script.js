var CONT = 0;
var QUESTIONARIO;
var ALTERNATIVAS_MARCADAS = [];
var $BTN_PROXIMA = $('.card-footer button');
var RELATORIO = new Array();
var $form = $('form.form-js');

const TEMPLATE_REL_PT1 = '<div class="card card-questao card-cabecalho card-js bg-light mb-3">' +
                            '<div class="card-body">' +
                                '<h5 class="card-text text-center"></h5>' +
                            '</div>' +
                        '</div>' +
                        '<h5>CONFIRA O GABARITO DAS QUESTÕES:</h5>' +
                        '<section class="gabarito-js"></section>';

const TEMPLATE_REL_QST = '<div class="card card-questao bg-light mb-3">' +
                            '<div class="card-body"></div>' +
                        '</div>'

function passarPagina() {
    salvarRespostas();
    $BTN_PROXIMA.addClass('disabled');
    ALTERNATIVAS_MARCADAS.splice(0);
    let $card = $('div.card-questao');
    let aux = parseInt($('html').css('width').split('px')[0]);
    $card.animate({ left: -aux }, 500);
    $card.animate({ left: +aux }, 0, function() {
        CONT++;
        if(CONT+1 == QUESTIONARIO.length)
            $BTN_PROXIMA.text('Enviar Respostas')
            .removeClass('btn-secondary')
            .addClass('btn-warning');
        if(CONT < QUESTIONARIO.length)
            prepararProximaQuestao();    
        else
            gerarRelatorio();
            
        $card.animate({ left: 0 }, 500);        
    }); 
};

function prepararProximaQuestao() {
    let q = QUESTIONARIO[CONT];
    $('.card .card-title').text((CONT+1) + " / " + QUESTIONARIO.length);
    $('.card .card-text').text(q.enunciado);
    let ckbTemplate = "";
    for(let i = 0 ; i<q.alternativas.length ; i++)
        ckbTemplate += '<div class="form-group form-check">' +
                                '<input type="checkbox" class="form-check-input" id="' + q.alternativas[i].cod + '">' +
                                '<label class="form-check-label" for="' + q.alternativas[i].cod + '">' + q.alternativas[i].label + '</label>' +
                            '</div>';
    $('.card .alternativas-js').empty().append(ckbTemplate);
};

function gerarRelatorio() {
    $('div.text-right').remove();
    $form.empty().append(TEMPLATE_REL_PT1);
    
    marcarRespostasDoGabarito();

    let acertos = 0;
    for(let i=0 ; i< QUESTIONARIO.length ; i++) {
        let gabarito = QUESTIONARIO[i];
        let acertosParciais = 0;
        let qtdRespostasCertasGabarito = 0;        
        for(let j=0 ; j<gabarito.alternativas.length ; j++) {
            if(gabarito.alternativas[j].status === true)
                qtdRespostasCertasGabarito++;
            for(let k=0 ; k<RELATORIO[i].respostasUsuario.length ; k++) {
                if(gabarito.alternativas[j].status === true 
                    && gabarito.alternativas[j].cod === RELATORIO[i].respostasUsuario[k])
                    acertosParciais++;
                if(gabarito.alternativas[j].status === false 
                    && gabarito.alternativas[j].cod === RELATORIO[i].respostasUsuario[k])
                    acertosParciais--;
            }
        }
        if(acertosParciais === qtdRespostasCertasGabarito) {
            acertos++;
            $('#cardquestao'+i+' .certo-errado').append('<i class="fas fa-check"></i>');
        } else $('#cardquestao'+i+' .certo-errado').append('<i class="fas fa-times"></i>');
    }

    $('.card-cabecalho .card-text').text("VOCÊ ACERTOU " + acertos + " DE " + QUESTIONARIO.length + " QUESTÕES");
    
    marcarRespostasDoUsuario();
};

function salvarRespostas() {
    let aux = [];
    $.each(ALTERNATIVAS_MARCADAS, function(i){
        aux.push(ALTERNATIVAS_MARCADAS[i]);
    });
    RELATORIO.push({ respostasUsuario: aux });
};

function marcarRespostasDoGabarito() {
    for(let i=0 ; i< QUESTIONARIO.length ; i++) {
        let q = QUESTIONARIO[i];
        let templateRelQuestao = '<div id="cardquestao'+i+'" class="card card-questao card-js bg-light mb-3">' +
                                    '<h5 class="card-header"><span class="certo-errado"></span>&nbsp;' + q.enunciado + '</h5>' +
                                    '<div class="card-body"></div>' +
                                '</div>'        
        $('.gabarito-js').append(templateRelQuestao);
        
        for(let j=0 ; j<q.alternativas.length ; j++) {
            let ckbTemplate = '<div class="form-group form-check">' +
                                '<input type="checkbox" class="form-check-input" id="' + q.alternativas[j].cod + '" disabled>' +
                                '<label class="form-check-label" for="' + q.alternativas[j].cod + '">' + q.alternativas[j].label + '</label>' +
                            '</div>';        
            $('#cardquestao' + i + " .card-body").append(ckbTemplate);
        }

        for(let j=0 ; j<q.alternativas.length ; j++) {
            if(q.alternativas[j].status === true)
                $('input#'+q.alternativas[j].cod).next().addClass('resposta-certa');
        }
    }
};

function marcarRespostasDoUsuario() {
    for(let i=0 ; i< QUESTIONARIO.length ; i++) {
        let gabarito = QUESTIONARIO[i];    
        for(let j=0 ; j<gabarito.alternativas.length ; j++) {
            for(let k=0 ; k<RELATORIO[i].respostasUsuario.length ; k++) {
                if(gabarito.alternativas[j].cod === RELATORIO[i].respostasUsuario[k])
                    $('input#'+gabarito.alternativas[j].cod).prop( "checked" , true);
            }
        }
    }
};






$(function() {
    $.ajax({
        type: "GET",
        url: "questionario.json",
        dataType : 'json',
        //headers: {'X-Requested-With': 'XMLHttpRequest'},
        //crossDomain: false,
        success: function(data) {
            QUESTIONARIO = data;
            prepararProximaQuestao();
        },
        error: function(data) {
            console.log(data);
        } 
    });
    
    $(document).on('change', 'input.form-check-input', function() {
        ALTERNATIVAS_MARCADAS.splice(0);
        $("input:checked").each(function() {
            ALTERNATIVAS_MARCADAS.push($(this).attr("id"));
        });
        if(ALTERNATIVAS_MARCADAS.length > 0)
            $BTN_PROXIMA.removeClass('disabled');
        else
            $BTN_PROXIMA.addClass('disabled');
    });

    $form.submit(function(e) {
        e.preventDefault();
        if(ALTERNATIVAS_MARCADAS.length > 0)
            passarPagina();
    });
});