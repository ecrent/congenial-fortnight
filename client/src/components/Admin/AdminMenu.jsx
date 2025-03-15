import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminMenu = () => {
  return (
    <div className="list-group mb-4">
      <NavLink 
        to="/admin" 
        className={({ isActive }) => 
          `list-group-item list-group-item-action ${isActive ? 'active' : ''}`
        }
        end
      >
        Dashboard
      </NavLink>
      <NavLink 
        to="/admin/users" 
        className={({ isActive }) => 
          `list-group-item list-group-item-action ${isActive ? 'active' : ''}`
        }
      >
        Users
      </NavLink>
      <NavLink 
        to="/admin/schedules" 
        className={({ isActive }) => 
          `list-group-item list-group-item-action ${isActive ? 'active' : ''}`
        }
      >
        Schedules
      </NavLink>
      <NavLink 
        to="/admin/sessions" 
        className={({ isActive }) => 
          `list-group-item list-group-item-action ${isActive ? 'active' : ''}`
        }
      >
        Sessions
      </NavLink>
    </div>
  );
};

export default AdminMenu;
