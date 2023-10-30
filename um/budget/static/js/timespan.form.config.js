window.timespanFormConfig = (function() {
    let getFormTitleEle = function () {
        return $("#id_timespan_form_title")[0];
    };
    let _toTimespanAction = function () {};
    let _toCurrentPeriodAction = function () {};
    let _useDates = false;
    let _fromDate = null;
    let _toDate = null;
    let _timespanRadio = "#id_timespan";
    let _idFrom = "#id_timespan_from";
    let _idTo = "#id_timespan_to";
    let _validFunc = function () {
        // No point in extensive date validation, have to do that server side anyway
        return !_useDates || _fromDate.value.length !== 0 && _toDate.value.length !== 0
            && _fromDate.value <= _toDate.value;
    };

    let obj = {
        fromDateStr: '0001-01-01',
        toDateStr: '9999-12-31',
        init: function (findStart = null) {
            if (findStart != null) {
                _fromDate = $(findStart).find(_idFrom);
                _toDate = $(findStart).find(_idTo);
            }
            if (_fromDate == null) {
                _fromDate = $(_idFrom);
            }
            if (_toDate == null) {
                _toDate = $(_idTo);
            }
            _fromDate = _fromDate[0];
            _toDate = _toDate[0];

            if (_fromDate.value.length > 0 && _toDate.value.length > 0) {
                this.fromDateStr = _fromDate.value;
                this.toDateStr = _toDate.value;
                _fromDate.type = "date";
                _toDate.type = "date";
                _useDates = true;
                $(_timespanRadio)[0].checked = true;
            }

            _fromDate.addEventListener("change", _validFunc);
            _toDate.addEventListener("change", _validFunc);
        },
        trySetTimespan: function (findStart = null) {
            if (_fromDate == null || _toDate == null) {
                this.init(findStart);
            }
            _useDates = true;

            if (_validFunc()) {
                this.fromDateStr = _fromDate.value;
                this.toDateStr = _toDate.value;
                _toTimespanAction(_fromDate.value, _toDate.value);
            }
        },
        toTimespan: function (event) {
            this.trySetTimespan(event.target.parentElement);
        },
        toCurrentPeriod: function (event) {
            _useDates = false;
            _toCurrentPeriodAction();
        },
        handleTimeSpanDateChange: function (event) {
            window.forms.toggleDateControl(event);
            let asncestor = event.target.parentElement.parentElement.parentElement.parentElement;
            let timespanRadio = $(asncestor).find(_timespanRadio)[0] ?? $(_timespanRadio);
            // element got focus
            if (event.target == document.activeElement) {
                timespanRadio.checked = true;
            } else if (timespanRadio.checked) {
                this.trySetTimespan(event.target.parentElement);
            }
        },
        set formTitle(value) {
            getFormTitleEle().innerText = value;
        },
        get formTitle() {
            return getFormTitleEle().innerText;
        },
        set toTimespanAction(value) {
            _toTimespanAction = value;
        },
        get toTimespanAction() {
            return _toTimespanAction;
        },
        set toCurentPeriodAction(value) {
            _toCurrentPeriodAction = value;
        },
        get toCurentPeriodAction() {
            return _toCurrentPeriodAction;
        },
        get useDates() {
            return _useDates;
        },
        get isValid() {
            return _validFunc();
        },
    };
    window.addEventListener("load", function () {
        obj.init();
    });
    return obj;
})();