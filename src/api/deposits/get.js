import apiClient from "../axios";

/**
 * Lấy thông tin deposit theo orderId
 * 
 * @param {Number|String} orderId - Mã đơn hàng
 * @returns {Promise} Response chứa deposit info (bao gồm paid status)
 */
export const getDepositByOrderId = async (orderId) => {
    // Backend endpoint: GET /api/deposits/order/{orderId}
    return apiClient.get(`/deposits/order/${orderId}`)
}
