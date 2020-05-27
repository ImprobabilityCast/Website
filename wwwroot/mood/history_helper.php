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
      foreach ($num_cols as $col_name) {
				$row[$col_name] = $this->trim_num($row[$col_name]);
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

  private function trim_num($value) {
    return substr($value, -5) * 1;
	}
	
	public function basic_mood() {
		return $this->get_data('basic_mood', ['overall', 'secondary']);
	}
	
	public function suicide() {
		return $this->get_data('suicide',
				['thoughts', 'urges', 'steps'],
				['thoughts', 'urges']
		);
	}
	
	public function self_harm() {
		return $this->get_data('self_harm',
				['place', 'tool_used', 'how_deep', 'emote_response', 'purpose'],
				['purpose']
		);
	}
	
	public function depression() {
		$cols = ['energy', 'motivation', 'hygine'];
		return $this->get_data('depression', $cols, $cols);
	}
	
	public function anxiety() {
		return $this->get_data('anxiety',
				['felt_where', 'intensity', 'panic'],
				['panic', 'intensity']
		);
	}
	
	public function fog() {
    $cols = ['comp_speed', 'forget', 'slurr'];
		return $this->get_data('fog', $cols, $cols);
	}
	
	public function anger() {
		return $this->get_data('anger', ['expression', 'thought']);
	}
	
	public function food() {
    $cols = ['after_wake', 'between_food', 'protein_veggie'];
		return $this->get_data('food', $cols, $cols);
	}
	
	public function sleeps() {
		return $this->get_data('sleep',
				['fell_asleep', 'woke_up', 'sleep_spent_awake', 'quality', 'meds'],
				['sleep_spent_awake', 'quality'],
				['fell_asleep', 'woke_up']
		);
	}
	
	public function people() {
		return $this->get_data('people',
				['what_do', 'what_impact', 'interaction_rating'],
				['interaction_rating']
		);
	}
	
	public function swings() {
		return $this->get_data('swings',
				['swing_trigger', 'mood_before', 'mood_after'],
				['mood_before', 'mood_after']
		);
	}
	
	public function notes() {
		return $this->get_data('notes', ['note']);
	}

	private function count_mechs($mech_arr) {
		$data = [];
		foreach ($mech_arr as $value) {
			$mech = $this->user->decryptData($value['mech']);
			$helpful = $this->user->decryptData($value['helpful'])[-1];
			if (!array_key_exists($key, $data)) {
				$data[$key] = ['helpful' => 0, 'total' => 0];
			}
			if ($helpful == 1) {
				$data[$key]['helpful']++;
			}
			$data[$key]['total']++;
		}
		return $data;
	}

	public function mechs() {
		$sql = 'SELECT mech, helpful FROM coping_mechs_help
			WHERE id=? AND stamp>=? AND stamp<=?';
		$statement = $this->dbh->prepare($sql);
		$statement->bindParam(1, $this->user->id);
		$statement->bindParam(2, $start);
		$statement->bindParam(3, $end);

		$statement->execute();
		$raw_data = $statement->fetchAll(PDO::FETCH_ASSOC);
		return $this->count_mechs($raw_data);
	}

}

?>
