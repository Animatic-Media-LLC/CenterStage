import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { resetUserPassword, updateUserPassword, isSuperAdmin } from '@/lib/db/users';

/**
 * POST /api/users/[id]/password
 * Reset or update user password (super admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only super admins can reset passwords
    const isSuperAdminUser = await isSuperAdmin(session.user.id);
    if (!isSuperAdminUser) {
      return NextResponse.json(
        { error: 'Forbidden - Super admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { password } = body;

    let newPassword: string;

    if (password) {
      // Use custom password
      await updateUserPassword(id, password);
      newPassword = password;
    } else {
      // Generate random password
      newPassword = await resetUserPassword(id);
    }

    return NextResponse.json({ password: newPassword });
  } catch (error) {
    console.error('Failed to reset password:', error);
    return NextResponse.json(
      {
        error: 'Failed to reset password',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
