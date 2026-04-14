const { Op } = require('sequelize');
const User = require('../models/User.js');
const {
  sendAccountUpdateEmail,
  sendAccountDeletedEmail
} = require('../utils/emailService.js');

// ── GET ALL USERS ──────────────────────────────────────
// GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const whereCondition = {};

    if (search) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    if (role) {
      whereCondition.role = role;
    }

    if (status) {
      whereCondition.isActive = status === 'active' ? true : false;
    }

    const users = await User.findAll({
      where: whereCondition,
      // Never return password field to Admin
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      message: 'Users fetched successfully',
      count: users.length,
      users
    });

  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

// ── GET SINGLE USER ────────────────────────────────────
// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      // Never return password field to Admin
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        errorCode: 404,
        message: 'Not Found',
        description: `No user found with ID ${id}`
      });
    }

    return res.status(200).json({
      message: 'User fetched successfully',
      user
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

// ── UPDATE USER ────────────────────────────────────────
// PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Block any attempt to update password through this endpoint
    if (req.body.password) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Password cannot be updated through this endpoint'
      });
    }

    // Check at least one field is provided
    if (!name && !email && !role) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Please provide at least one field to update: name, email, or role'
      });
    }

    // Find the user
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        errorCode: 404,
        message: 'Not Found',
        description: `No user found with ID ${id}`
      });
    }

    // Admin cannot update another Admin account
    if (user.role === 'Admin' && user.id !== req.user.userId) {
      return res.status(403).json({
        errorCode: 403,
        message: 'Forbidden',
        description: 'You cannot update another Admin account'
      });
    }

    // Cannot update a deactivated user
    if (!user.isActive) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Cannot update a deactivated user. Please activate them first.'
      });
    }

    // Validate name
    if (name !== undefined) {
      if (!name || !name.trim()) {
        return res.status(400).json({
          errorCode: 400,
          message: 'Bad Request',
          description: 'Name cannot be empty'
        });
      }

      if (name.trim().length < 2) {
        return res.status(400).json({
          errorCode: 400,
          message: 'Bad Request',
          description: 'Name must be at least 2 characters long'
        });
      }

      if (name.trim().length > 100) {
        return res.status(400).json({
          errorCode: 400,
          message: 'Bad Request',
          description: 'Name cannot exceed 100 characters'
        });
      }

      const nameRegex = /^[a-zA-Z\s]+$/;
      if (!nameRegex.test(name.trim())) {
        return res.status(400).json({
          errorCode: 400,
          message: 'Bad Request',
          description: 'Name can only contain letters and spaces'
        });
      }
    }

    // Validate email
    if (email !== undefined) {
      if (!email || !email.trim()) {
        return res.status(400).json({
          errorCode: 400,
          message: 'Bad Request',
          description: 'Email cannot be empty'
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
          errorCode: 400,
          message: 'Bad Request',
          description: 'Please provide a valid email address'
        });
      }

      if (email !== user.email) {
        const emailExists = await User.findOne({
          where: {
            email: email.trim(),
            id: { [Op.ne]: id }
          }
        });

        if (emailExists) {
          return res.status(400).json({
            errorCode: 400,
            message: 'Bad Request',
            description: 'This email is already used by another user'
          });
        }
      }
    }

    // Validate role
    if (role !== undefined) {
      if (!role || !role.trim()) {
        return res.status(400).json({
          errorCode: 400,
          message: 'Bad Request',
          description: 'Role cannot be empty'
        });
      }

      const allowedRoles = ['Admin', 'ProjectManager', 'Collaborator'];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          errorCode: 400,
          message: 'Bad Request',
          description: `Role must be one of: ${allowedRoles.join(', ')}`
        });
      }
    }

    // Track what actually changed to include in the email
    const updatedFields = {};
    if (name && name.trim() !== user.name) updatedFields['Name'] = name.trim();
    if (email && email.trim() !== user.email) updatedFields['Email'] = email.trim();
    if (role && role !== user.role) updatedFields['Role'] = role;

    // Update the user
    await user.update({
      name: name ? name.trim() : user.name,
      email: email ? email.trim() : user.email,
      role: role || user.role
    });

    // Send update email only if something actually changed
    if (Object.keys(updatedFields).length > 0) {
      try {
        await sendAccountUpdateEmail(user.email, user.name, updatedFields);
      } catch (emailError) {
        // Email failed but update was successful - just log it
        console.error('Update email sending failed:', emailError.message);
      }
    }

    return res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

// ── DEACTIVATE USER ────────────────────────────────────
// PATCH /api/users/:id/deactivate
const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        errorCode: 404,
        message: 'Not Found',
        description: `No user found with ID ${id}`
      });
    }

    // Admin cannot deactivate another Admin
    if (user.role === 'Admin' && user.id !== req.user.userId) {
      return res.status(403).json({
        errorCode: 403,
        message: 'Forbidden',
        description: 'You cannot deactivate another Admin account'
      });
    }

    // Admin cannot deactivate themselves
    if (user.id === req.user.userId) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'You cannot deactivate your own account'
      });
    }

    if (!user.isActive) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'This user is already deactivated'
      });
    }

    await user.update({ isActive: false });

    return res.status(200).json({
      message: `User ${user.name} has been deactivated successfully`
    });

  } catch (error) {
    console.error('Deactivate user error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

// ── ACTIVATE USER ──────────────────────────────────────
// PATCH /api/users/:id/activate
const activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        errorCode: 404,
        message: 'Not Found',
        description: `No user found with ID ${id}`
      });
    }

    if (user.isActive) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'This user is already active'
      });
    }

    await user.update({ isActive: true });

    return res.status(200).json({
      message: `User ${user.name} has been activated successfully`
    });

  } catch (error) {
    console.error('Activate user error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

// ── DELETE USER ────────────────────────────────────────
// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        errorCode: 404,
        message: 'Not Found',
        description: `No user found with ID ${id}`
      });
    }

    // Admin cannot delete another Admin account
    if (user.role === 'Admin' && user.id !== req.user.userId) {
      return res.status(403).json({
        errorCode: 403,
        message: 'Forbidden',
        description: 'You cannot delete another Admin account'
      });
    }

    // If Admin is deleting their own account
    // check at least one other Admin exists in the database
    if (user.id === req.user.userId) {
      const otherAdminCount = await User.count({
        where: {
          role: 'Admin',
          isActive: true,
          id: { [Op.ne]: req.user.userId }
        }
      });

      if (otherAdminCount === 0) {
        return res.status(400).json({
          errorCode: 400,
          message: 'Bad Request',
          description: 'You cannot delete your own account because you are the only Admin. Please create another Admin first.'
        });
      }
    }

    // Store user details before deleting for the email
    const deletedUserEmail = user.email;
    const deletedUserName = user.name;

    // Permanently delete the user from the database
    await user.destroy();

    // Send deletion notification email
    try {
      await sendAccountDeletedEmail(deletedUserEmail, deletedUserName);
    } catch (emailError) {
      console.error('Deletion email sending failed:', emailError.message);
    }

    return res.status(200).json({
      message: `User ${deletedUserName} has been permanently deleted`
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  activateUser,
  deleteUser
};