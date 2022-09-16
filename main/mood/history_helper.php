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

	private function get_data($table, $cols,
		$num_cols = [], $time_cols = []) {
		$cols_str = implode(',', $cols);
		$sql = "SELECT $cols_str, stamp FROM $table WHERE id=?
				AND stamp>=? AND stamp<=?";
		$statement = $this->dbh->prepare($sql);
		$statement->bindParam(1, $this->user->id);
		$statement->bindParam(2, $this->start);
		$statement->bindParam(3, $this->end);
		$statement->execute();
		$data = [];

		while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
			foreach ($cols as $col_name) {
				$row[$col_name] = $this->user->decryptData($row[$col_name]);
			}
			foreach ($num_cols as $col_name => $bit_len) {
						$row[$col_name] = $this->trim_num($row[$col_name], $bit_len);
			}
			foreach ($time_cols as $col_name) {
						$row[$col_name] = $this->trim_time($row[$col_name]);
			}
			array_push($data, $row);
		}

		$statement = null;
		return $data;
	}
		
	private function trim_time($value) {
			return substr($value, -5);
	}

	private function trim_num($value, $bit_len) {
		return ord($value[-1]) & ~(-1 << $bit_len);
	}
	
	public function basic_mood() {
		return $this->get_data('basic_mood', ['overall', 'secondary']);
	}
	
	public function suicide() {
		return $this->get_data('suicide',
				['thoughts', 'urges', 'steps'],
				['thoughts' => 3, 'urges' => 3]
		);
	}
	
	public function self_harm() {
		return $this->get_data('self_harm',
				['place', 'tool_used', 'how_deep', 'emote_response', 'purpose'],
				['purpose' => 2]
		);
	}
	
	public function depression() {
		$cols = ['energy', 'motivation', 'hygine'];
		return $this->get_data('depression', $cols,
			[$cols[0] => 7, $cols[1] => 7, $cols[2] => 7]
		);
	}
	
	public function anxiety() {
		return $this->get_data('anxiety',
				['felt_where', 'intensity', 'panic'],
				['panic' => 2, 'intensity' => 7]
		);
	}
	
	public function fog() {
    $cols = ['comp_speed', 'forget', 'slurr'];
		return $this->get_data('fog', $cols,
			[$cols[0] => 7, $cols[1] => 3, $cols[2] => 3]
		);
	}
	
	public function anger() {
		return $this->get_data('anger', ['expression', 'thought']);
	}
	
	public function food() {
    $cols = ['after_wake', 'between_food', 'protein_veggie'];
		return $this->get_data('food', $cols,
			[$cols[2] => 2],
			['after_wake', 'between_food']
		);
	}
	
	public function sleeps() {
		return $this->get_data('sleep',
				['fell_asleep', 'woke_up', 'sleep_spent_awake', 'quality', 'meds'],
				['quality' => 2],
				['fell_asleep', 'woke_up', 'sleep_spent_awake']
		);
	}
	
	public function people() {
		return $this->get_data('people',
				['what_do', 'what_impact', 'interaction_rating'],
				['interaction_rating' => 7]
		);
	}
	
	public function swings() {
		return $this->get_data('swings',
				['swing_trigger', 'mood_before', 'mood_after'],
				['mood_before' => 7, 'mood_after' => 7]
		);
	}
	
	public function notes() {
		return $this->get_data('notes', ['note']);
	}

	private function count_mechs($mech_arr) {
		$data = [];
		foreach ($mech_arr as $value) {
			$mech = $this->user->decryptData($value['mech']);
			$helpful = $this->trim_num($this->user->decryptData($value['helpful']), 3);
			if (!array_key_exists($mech, $data)) {
				$data[$mech] = ['helpful' => 0, 'total' => 0];
			}
			if ($helpful == 1) {
				$data[$mech]['helpful']++;
			}
			$data[$mech]['total']++;
		}
		return $data;
	}

	public function mechs() {
		$sql = 'SELECT mech, helpful, stamp FROM coping_mechs_help
			WHERE id=? AND stamp>=? AND stamp<=?';
		$statement = $this->dbh->prepare($sql);
		$statement->bindParam(1, $this->user->id);
		$statement->bindParam(2, $this->start);
		$statement->bindParam(3, $this->end);

		$statement->execute();
		$raw_data = $statement->fetchAll(PDO::FETCH_ASSOC);
		return $this->count_mechs($raw_data);
	}

}

?>
