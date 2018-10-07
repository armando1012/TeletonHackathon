'use strict';


var app = {},
    miner,
    timeDonated = 0,
    tSpeed = 500,
    mining = false,
    miningSpeed = 60,
    hashesTotal = 0,
    hashesAccepted = 0,
    hMeterTotal = 0,
    hMeterAccepted = 0,
    textCounter,
    resizeCounter,
    causeText,
    currentVideo = 0,
    firstRun = true;

$(function() {
    app.init();
});

app.init = function() {
    app.setEnvironment();
    //app.updateStats();
    app.clickHandlers();
    app.renderDial();
    app.miner();
    //app.urlRoute();
};

app.setEnvironment = function() {
    if (location.hostname === 'localhost') {
        $('body').attr('data-debug', true);
    }
};

app.clickHandlers = function() {
    $('.btnStart').click(function() {
        app.toggleMining(true);
        app.maskFrame();
        $('.modal .btn.btnClose').show();
        $('.modal .btnStart').remove();
    });
    $('.btnStop').click(function () {
        miner.stop();
        window.location.href = "Gracias.html";
    });
    $('.modal .btnClose').click(function() {
        $('.modal').fadeOut(tSpeed);
        $('body').removeClass('active-modal');
    });
    $('.btnHow').click(function() {
        $('.modal-instruction').fadeIn(tSpeed);
        $('body').addClass('active-modal');
    });
    $('.btnSubscribeForm').click(function(e) {
        e.preventDefault();
        $('.modal-subscribe').fadeIn(tSpeed);
        $('body').addClass('active-modal');
    });
    $('.btnSubscribeEmail').click(function(e) {
        app.SubscribeForm();
    });
    $('.btnSettings, .settings-container .btnConfirm').click(function() {
        $('.linear-dial').val(miningSpeed).change();
        $('.settings-menu').toggleClass('active');
        $('.global-wrapper').toggleClass('active-menu');
        $('body').toggleClass('active-menu');
    });
    $('.intro .panel-two .btnConfirm').click(function() {
        $('.bgImage').fadeOut(tSpeed);
        $('.intro').fadeOut(tSpeed, function() {
            $('.donating').fadeIn(tSpeed);
            $('.settings').fadeIn(tSpeed);
            $('.bgVideo').fadeIn(tSpeed);
            //app.startVideos();
        });
    });
    window.onresize = function() {
        clearTimeout(resizeCounter);
        resizeCounter = setTimeout(app.renderDial, 100);
    };
};

app.miner = function() {
    $('.intro .loading').hide();
    $('.intro .btnStart').css('display', 'inline-block');
    miner = new CoinHive.User('tNU1LodX5O0BAWgMh3jK1Acpx6PNPNR8', 'Dona Teletón', { throttle: 0.4 });
    miner.on('authed', function(params) {
        console.log('Token name is: ', miner.getToken());
    });
    miner.on('error', function(params) {
        if (params.error !== 'connection_error') {
            console.log('The pool reported an error', params.error);
        }
    });
    miner.on('optin', function(params) {
        if (params.status === 'accepted') {
            mining = true;
            console.log('User accepted opt-in');
            app.startMiner();
            $('.modal').fadeOut(tSpeed);;
            $('.intro .panel-one').fadeOut(tSpeed, function() {
                $('.linear-dial').val(miningSpeed).change();
                $('.intro .panel-two').fadeIn(tSpeed);
                $('.frame-mask').hide()
            });
        } else {
            console.log('User canceled opt-in');
        }
    });
}

app.toggleMining = function() {
    var stats;
    if (mining === false) {
        miner.start();
    }
}
app.startMiner = function() {
    // $('.counter .blurb-2').show();
    $('.counter .blurb-2').slideDown(800);

    // $.ajax({
    //         url: "/lib/actions.php",
    //         method: "GET",
    //     })
    //     .done(function() {
    //         //console.log('pushed start');
    //     });
    setInterval(function() {
        var HPS = miner.getHashesPerSecond();
        var TH = miner.getTotalHashes();
        var AH = miner.getAcceptedHashes();
        if (TH > hashesTotal) {
            hashesTotal = TH;
            if (hMeterTotal === 10) {
                hMeterTotal = 1;
                $('.hashes.total').addClass('reset');
                $('.hashes.total').css('height', 0);
            } else {
                hMeterTotal++;
            }
            $('.hashes.total').css('height', (hMeterTotal * 10) + '%');
            $('.hashes.total').removeClass('reset');
        }
        if (AH > hashesAccepted) {
            hashesAccepted = AH;
            if (hMeterAccepted === 10) {
                hMeterAccepted = 1;
                $('.hashes.accepted').addClass('reset');
                $('.hashes.accepted').css('height', 0);
            } else {
                hMeterAccepted++;
            }
            $('.hashes.accepted').css('height', (hMeterAccepted * 10) + '%');
            $('.hashes.accepted').removeClass('reset');
        }
        $('.hashes-total').html('TOTAL HASHES ' + TH);
        $('.hashes-second').html('HASHES/SEC ' + Math.ceil(HPS));
        timeDonated++;
        app.cycleCause();
        app.updateCounter();
    }, 1000);
    setInterval(function() {
        //app.updateStats();
    }, 6000);
    setInterval(function() {
        //app.sendStats();
    }, 30000);
    // $('footer .links').show();
    $('footer .links').fadeIn(tSpeed);
}
app.updateStats = function() {
    $.ajax({
            url: "/json/count.json",
            method: "GET",
        })
        .done(function(data) {
            if (data.donations) {
                $('.counter .value').html(data.donations.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
                $('.counter').fadeIn(tSpeed);
            }
        });
}
app.sendStats = function() {
    if (mining) {
        $.ajax({
                url: "/lib/actions.php?count",
                method: "GET",
            })
            .done(function() {
                //console.log('pushed count');
            });
    }
}
app.updateCounter = function() {
    var minutes = Math.floor(timeDonated / 60);
    var seconds = timeDonated - minutes * 60;
    if (seconds.toString().length < 2) seconds = '0' + seconds;
    $('.userDuration').html(minutes + ':' + seconds);
}
app.cycleCause = function() {
    var text = [
            'water',
            'food',
            'books'
        ],
        currentText = $('.causeText').text(),
        match = false;
    if (timeDonated % 5 === 0) {
        for (var i = 0; i < text.length; i++) {
            if (currentText === text[i]) {
                match = true;
                if (i === text.length - 1) {
                    causeText = text[0];
                } else {
                    causeText = text[i + 1];
                }
                $('.causeText').fadeOut(tSpeed, function() {
                    $('.causeText').text(causeText);
                    $('.causeText').fadeIn(1000);
                });
            }
        }
        if (!match) $('.causeText').text(text[0]);
    }
}

app.renderDial = function() {
    $('.panel-two').addClass('render');
    $('.linear-dial').rangeslider({
        polyfill: false,
        onInit: function() {},
        onSlide: function(position, value) {
            console.log('value:', value);
            if (firstRun && value === 20) {
                console.log('>>>>>');
                //weird bug fix
                setTimeout(function() {
                    firstRun = false;
                    $('.linear-dial').rangeslider('update', true);
                }, 100);

            }
            // Update display value
            $('.power .value').html(value + '<span class="percentage">%</span>');
            // Change throttle
            miner.setThrottle((100 - value) / 100);
        },
        onSlideEnd: function(position, value) {
            miningSpeed = value;
        },
    });
    $('.panel-two').removeClass('render');
}

app.startVideos = function() {
    var vid = $('#vid')[0],
        vidArray = ['video/CLIP_01.mp4', 'video/CLIP_02.mp4', 'video/CLIP_03.mp4'];
    if (!miner.isMobile()) {
        vid.play();
        vid.addEventListener('ended', function() {
            currentVideo++;
            if (currentVideo === vidArray.length) currentVideo = 0;
            vid.src = vidArray[currentVideo];
            vid.play();
        });
    }
}

app.maskFrame = function() {
    var frameLoop = setInterval(function() {
        var frame = document.querySelector("iframe");
        if (frame) {
            clearInterval(frameLoop);
            $(frame).parent().append("<div class='frame-mask'></div>");
            var dist = $(frame).css('height').replace(/\D/g, '') / 2;
            dist = dist - 80;
            $('.frame-mask').css('transform', 'translate(-50%, ' + dist + 'px)');
        }
    }, 100);
}