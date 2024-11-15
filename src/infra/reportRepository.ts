import { ArchSQLCore } from 'FrameworkBAExpress'; // Usando o módulo ArchSQLCore do FrameworkBAExpress

export const reportRepository = {
  async getOperationsReport() {
    const query = `
      SELECT d.deposit_name AS deposit, st.service_name AS loop, r.route_name AS route, 
             u.username AS courier, om.fail_delivery AS "failDelivery", 
             om.arrival_time AS "arrivalTime", om.departure_time AS "departureTime", 
             om.spr, om.sporh
      FROM operations_management om
      JOIN deposits d ON om.deposit_id = d.deposit_id
      JOIN service_types st ON om.service_type_id = st.service_type_id
      JOIN routes r ON om.route_id = r.route_id
      JOIN users u ON om.driver_id = u.user_id;
    `;

    try {
      const result = await ArchSQLCore.executeQuery(query, []);
      return result;
    } catch (error) {
      throw new Error(`Error executing query: ${error.message}`);
    }
  },
};
