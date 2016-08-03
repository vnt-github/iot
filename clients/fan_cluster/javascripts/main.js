var status = [];
var level = [];
for (var i = 0; i < 9; i++) {
	status[i] = 'off';
	level[i] = 0;
}

var $fanWrap = $('.fan-wrap');
var $status = $('.fan-status');
var $statusWrap = $('.fan-status-wrap');

var socket = [];

function changeFanStatus(message, index) {
	level[index] = message.level;
	$status.eq(index).html(level[index]);
	if (message.status === 'on') {
		status[index] = 'on';
		var duration = 3000 - level[index] / 100 * 2700;
		duration = parseInt(duration, 10) + 'ms';
		var animation = duration + ' linear infinite rotate';
		$fanWrap.eq(index).find('.fan').css('animation', 'none');
		setTimeout(function () {
			$fanWrap.eq(index).find('.fan').css('animation', animation);
		});
	} else {
		status[index] = 'off';
		$fanWrap.eq(index).find('.fan').css('animation', 'none');
	}
	socket[index].emit('status', { status: status[index], level: level[index] });
}

for (i = 2; i <= 10; i++) {
	var s = io.connect('http://localhost:3000', { query: 'id=' + i + '&type=fan' });
	socket.push(s);
	(function (s, index) {
		s.on('connected', function () {
			s.emit('status', { status: status[index - 2], level: level[index - 2] });
			s.emit('get status');
		});
		s.on('status', function (message) {
			changeFanStatus(message, index - 2);
		});
		s.on('disconnect', function () {
			changeFanStatus({ status: 'off', level: 0 }, index - 2);
		});
	}(s, i));
}
