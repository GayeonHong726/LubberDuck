package com.lec.spring.service.order;

import com.lec.spring.domain.User;
import com.lec.spring.domain.order.Order;
import com.lec.spring.domain.order.Order_item;

import java.awt.*;
import java.util.List;

public interface OrderService {

    List<Order> findByUser(Long user_id);

}