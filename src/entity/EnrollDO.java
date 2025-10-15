package com.ted.exam.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;

/**
 * 考试报名实体类
 */
@Data
@TableName("ted_enroll")
@EqualsAndHashCode(callSuper = true)
public class EnrollDO extends BaseDO {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 考生id
     */
    private Long userId;

    /**
     * 考试计划id
     */
    private Long examPlanId;

    /**
     * 考试状态（0：未报名，1：已报名：2：已完成，3：已过期）
     */
    private Long enrollStatus;
} 