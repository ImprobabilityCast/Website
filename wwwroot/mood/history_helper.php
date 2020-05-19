<?php
require_once 'mood_util.php';

class HistoryHelper {
    private $start;
    private $end;
    private $dbh;
    private $user;

    function __construct($start, $end) {
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

    public function get_data($table, $cols) {
        $cols_str = implode(',', $cols);
        $sql = "SELECT $cols_str FROM table WHERE id=?
            AND stamp>=? AND stamp<=?";
        $statement = $this->dbh->prepare($sql);
        $statement->bindParam(1, $this->user->id);
        $statement->bindParam(2, $this->start);
        $statement->bindParam(3, $this->end);
        $statement->execute();

        $data = build_array($cols);
        while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
            foreach ($row as $col_name => $col_value) {
                array_push($data[$col_name], $user->decryptData($col_value));
            }
        }
        $statement = null;
        return $data;
    }

}

?>
