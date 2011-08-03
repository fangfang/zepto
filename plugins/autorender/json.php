<?php

$response = array(
	'data' => array(
		'array' => array(
			array(
				'name' => 'C',
                'img' => 'http://tp4.sinaimg.cn/1972030223/50/5606271982/1',
                'num' => '3',
                'title' => 'title3',
                'abs' => 'abs3'
			),
			array(
				'name' => 'D',
                'img' => 'http://tp4.sinaimg.cn/1972030223/50/5606271982/1',
                'num' => '4',
                'title' => 'title4',
                'abs' => 'abs4'
			),
			array(
				'name' => 'E',
                'img' => 'http://tp4.sinaimg.cn/1972030223/50/5606271982/1',
                'num' => '5',
                'title' => 'title5',
                'abs' => 'abs5'
			)
		),
		'tplName' => 'item'
	)
);

echo json_encode($response);
