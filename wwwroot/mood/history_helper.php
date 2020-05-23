<?php
require_once 'mood_util.php';

class HistoryHelper {
    private $start;
    private $end;
    private $dbh;
    private $user;

    public function __construct($start, $end) {
        $this->start = $start;
        $this->end = $end;
        $this->dbh = create_db_conn();
        $this->user =  new User($this->dbh);
    }

    private function build_array($keys) {
        $arr = [];
        for ($i = 0; $i < count($keys); $i++) {
            $arr[$keys[$i]] = [];
        }
        return $arr;
    }

    private function get_data($table, $cols) {
        $cols_str = implode(',', $cols);
        $sql = "SELECT $cols_str FROM $table WHERE id=?
            AND stamp>=? AND stamp<=?";
        $statement = $this->dbh->prepare($sql);
        $statement->bindParam(1, $this->user->id);
        $statement->bindParam(2, $this->start);
        $statement->bindParam(3, $this->end);
        $statement->execute();

        $data = $this->build_array($cols);
        while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
            foreach ($row as $col_name => $col_value) {
                array_push($data[$col_name], $this->user->decryptData($col_value));
            }
        }
        $statement = null;
        return $data;
    }

    private function process_ratings($arr, $num_digits = 1) {
        for ($i = 0; $i < count($arr); $i++) {
            $arr[$i] = substr($arr[$i], -$num_digits);
        }
    }
    
    private function array_avg($arr, $num_digits = 1, $round = true) {
        $this->process_ratings($arr, $num_digits);
        $len = count($arr);
    
        if ($len == 0) {
            return -1;
        } else if ($round) {
            return round(array_sum($arr) / $len);
        } else {
            return array_sum($arr) / $len;
        }
    }
    
    public function basic_mood() {
        return $this->get_data('basic_mood', ['overall', 'secondary']);
    }
    
    public function suicide() {
        $data = $this->get_data('suicide', ['thoughts', 'urges', 'steps']);
        $data['thoughts'] = $this->array_avg($data['thoughts']);
        $data['urges'] = $this->array_avg($data['urges']);
        return $data;
    }
    
    public function self_harm() {
        $data = $this->get_data('self_harm',
            ['place', 'tool_used', 'how_deep', 'emote_reponse', 'purpose']);
        $data['purpose'] = $this->array_avg($data['purpose']);
        return $data;
    }
    
    public function depression() {
        $cols = ['energy', 'motivation', 'hygine'];
        $data = $this->get_data('depression', $cols);
        foreach ($cols as $col) {
            $data[$col] = $this->array_avg($col);
        }
        return $data;
    }
    
    public function anxiety() {
        $data = $this->get_data('anxiety',
            ['felt_where', 'intensity', 'panic']);
        $data['panic'] = $this->array_avg($data['panic'], 1, false);
        $data['intensity'] = $this->array_avg($data['intensity']);
        return $data;
    }
    
    public function fog() {
        $data = $this->get_data('fog',
            ['comp_speed', 'forget', 'slurr']);
        $data['comp_speed'] = $this->array_avg($data['comp_speed'], 3, false);
        $data['forget'] = $this->array_avg($data['forget']);
        $data['slurr'] = $this->array_avg($data['forget']);
        return $data;
    }
    
    public function anger() {
        return $this->get_data('anger', ['expression', 'thought']);
    }
    
    public function food() {
        $data = $this->get_data('food',
            ['after_wake', 'between_food', 'protein_veggie']);
        $data['after_wake'] = $this->array_avg($data['after_wake'], 5, false);
        $data['between_food'] = $this->array_avg($data['between_food'], 5, false);
        $data['protein_veggie'] = $this->array_avg($data['protein_veggie'], 1, false);
        return $data;
    }
    
    public function sleeps() {
        $data = $this->get_data('sleep',
            ['fell_asleep', 'woke_up', 'sleep_spent_awake', 'quality', 'meds']);
        $data['fell_asleep'] = $this->array_avg($data['fell_asleep'], 4);
        $data['woke_up'] = $this->array_avg($data['woke_up'], 4);
        $data['sleep_spent_awake'] = $this->array_avg($data['sleep_spent_awake'], 5);
        $data['quality'] = $this->array_avg($data['quality']);
        return $data;
    }
    
    public function people() {
        $data = $this->get_data('people',
            ['what_do', 'what_impact', 'interaction_rating']);
        $data['interaction_rating'] = $this->array_avg($data['interaction_rating'], 3);
        return $data;
    }
    
    public function swings() {
        $data = $this->get_data('swings',
            ['swing_trigger', 'mood_before', 'mood_after']);
        $data['mood_before'] = $this->array_avg($data['before'], 3);
        $data['mood_after'] = $this->array_avg($data['mood_after'], 3);
        return $data;
    }
    
    public function notes() {
        return $this->get_data('notes', ['note']);
    }

}

?>
