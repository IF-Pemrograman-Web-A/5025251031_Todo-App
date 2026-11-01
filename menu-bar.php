<?php
$current_type = isset($_GET['type']) && $_GET['type'] === 'shared' ? 'shared' : 'personal';
?>
<aside class="sidebar-menu">
    <h3>Menu Navigation</h3>
    <nav>
        <ul>
            <li>
                <a href="index.php?type=personal" class="<?= $current_type === 'personal' ? 'active' : '' ?>">
                    Personal Todos
                </a>
            </li>
            <li>
                <a href="index.php?type=shared" class="<?= $current_type === 'shared' ? 'active' : '' ?>">
                    Shared Todos
                </a>
            </li>
        </ul>
    </nav>
</aside>
